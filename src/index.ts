// ── External Dependencies & Registrations
import { type Options, parse, type Parser } from 'csv-parse/browser/esm';
export type { Options, Parser } from 'csv-parse/browser/esm';

// ── DPUse Framework
import { ignoreErrors, parseDelimitedText, resolveDecoderId } from '@dpuse/dpuse-shared';
import type {
    ParserInterface,
    ParseStreamOptions,
    ParseTextOptions,
    ParseTextResult,
    ParsingRecord,
    PreviewIssue,
    RecordRetrievalTypeId,
    RetrieveRecordsSummary,
    ValueDelimiterId
} from '@dpuse/dpuse-shared';

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────────

type ParseError = Error & { code?: string; field?: unknown; index?: number; lines?: number; records?: number }; // The context csv-parse adds to an error.

interface StreamRecordBuffer {
    drain: () => Promise<void>; // Settles once the receiver has finished with every chunk handed to it so far.
    flush: () => void;
    push: (record: ParsingRecord) => void;
}

// ── Constants ────────────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Baseline parser configuration pinned to explicit values to prevent behavioural drift across parser upgrades.
 * Intentionally exhaustive, even where values mirror current defaults. See: https://csv.js.org/parse/options/ for more information.
 *
 * `cast`, `objname`, `on_record`, `on_skip`, and `to` are intentionally omitted rather than set to `undefined`:
 * their csv-parse types don't include `undefined` in the property's own type (only via the optional `?`), which
 * `exactOptionalPropertyTypes` rejects as an explicit assignment. Omitting the key is equivalent at runtime — csv-parse
 * treats "absent" and "explicitly undefined" identically — so this preserves the "pin every default explicitly"
 * intent without a type error. (`to`'s documented default of 1 also can't be used regardless: it triggers
 * `TypeError: "listener" argument must be a function`.)
 */
const DEFAULT_OPTIONS: Options = {
    bom: false,
    cast_date: false,
    columns: false,
    comment: '',
    comment_no_infix: false,
    delimiter: ',',
    encoding: 'utf-8',
    escape: '"',
    from: 1,
    from_line: 1,
    group_columns_by_name: false,
    ignore_last_delimiters: false,
    info: false,
    ltrim: false,
    max_record_size: 0,
    quote: '"',
    raw: false,
    record_delimiter: [],
    relax_column_count: false,
    relax_column_count_less: false,
    relax_column_count_more: false,
    // TODO: Offer relaxed quotes as a choice, for files the user knows are messy, e.g. a stray quote in '5" screen'.
    // Strict parsing stays the default. 'parseText' for the preview and the connectors' full reads would both take the
    // user's choice, so the two always read a file the same way. It belongs with the planned 'Read as' override.
    relax_quotes: false,
    rtrim: false,
    skip_empty_lines: false,
    skip_records_with_empty_values: false,
    skip_records_with_error: false,
    to_line: -1,
    trim: false
};

const DEFAULT_RECORD_BUFFER_POOL_SIZE = 4;

const MAX_ISSUE_VALUE_LENGTH = 50; // A value shown with an issue is cut short past this, because one never closed can run to the end of the text.

const DEFAULT_RECORD_BUFFER_SIZE = 10_000;

// ── Tools ────────────────────────────────────────────────────────────────────────────────────────────────────────────

export class Tool implements ParserInterface {
    /**
     * Parse stream. Reads delimited text from the stream. The caller owns the stream and its fetch, so a failed fetch is
     * the caller's to report. Aborting the signal stops the read and rejects with the signal's reason.
     */
    async parseStream(
        stream: ReadableStream<Uint8Array>,
        options: ParseStreamOptions,
        chunk: (typeId: RecordRetrievalTypeId, records: ParsingRecord[]) => void | Promise<void>
    ): Promise<RetrieveRecordsSummary> {
        return new Promise<RetrieveRecordsSummary>((resolve, reject) => {
            let parser: Parser | undefined;
            let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
            let recordBuffer: StreamRecordBuffer | undefined;
            let hasErrored = false;
            let hasStoppedProcessing = false;

            const stopProcessing = (): void => {
                if (hasStoppedProcessing) return;
                hasStoppedProcessing = true;

                const activeParser = parser;
                parser = undefined;
                recordBuffer = undefined;
                if (activeParser != null) {
                    ignoreErrors(() => activeParser.removeAllListeners());
                    ignoreErrors(() => activeParser.end());
                }
                ignoreErrors(() => void reader?.cancel());
                reader = undefined;
            };

            const handleError = (error: unknown): void => {
                if (hasErrored) return;

                hasErrored = true;
                stopProcessing();
                reject(error instanceof Error ? error : new Error(String(error)));
            };

            // The stream may not be tied to the signal, so an abort is acted on here rather than left to make a read fail.
            options.abortSignal.addEventListener(
                'abort',
                () => {
                    handleError(options.abortSignal.reason);
                },
                { once: true }
            );

            const run = async (): Promise<void> => {
                options.abortSignal.throwIfAborted();
                parser = parse({
                    ...DEFAULT_OPTIONS,
                    cast: (value, context): { value: string; valueWasQuoted: boolean } => ({ value, valueWasQuoted: context.quoting }),
                    delimiter: options.valueDelimiterId,
                    relax_column_count: true
                });
                const activeRecordBuffer = constructRecordBuffer({ chunk, chunkSize: options.chunkSize ?? DEFAULT_RECORD_BUFFER_SIZE });
                recordBuffer = activeRecordBuffer;
                parser.on('readable', () => {
                    try {
                        if (parser == null || recordBuffer == null) return;
                        let record: ParsingRecord | null;
                        while ((record = parser.read() as ParsingRecord | null) != null) {
                            if (hasErrored) return;
                            options.abortSignal.throwIfAborted();
                            recordBuffer.push(record);
                        }
                    } catch (error) {
                        handleError(error);
                    }
                });
                parser.on('error', (error) => {
                    handleError(error);
                });
                // Finished only once the receiver has finished with the last records too.
                const resolveOnceDrained = async (summary: RetrieveRecordsSummary): Promise<void> => {
                    try {
                        await activeRecordBuffer.drain();
                        resolve(summary);
                    } catch (error) {
                        handleError(error);
                    }
                };
                parser.on('end', () => {
                    if (hasErrored) return;
                    activeRecordBuffer.flush();
                    void resolveOnceDrained(constructSummary(parser));
                });

                reader = stream.getReader();
                const decoder = new TextDecoder(resolveDecoderId(options.encodingId));
                let byteCount = 0;
                let hasWrittenText = false;
                let result = await reader.read();
                while (!result.done) {
                    if (hasErrored) return;
                    options.abortSignal.throwIfAborted();
                    byteCount += result.value.length;
                    const decodedChunk = decoder.decode(result.value, { stream: true });
                    if (decodedChunk.length > 0) {
                        parser.write(decodedChunk);
                        hasWrittenText = true;
                    }
                    await activeRecordBuffer.drain(); // A receiver that is slower than the parser holds the read back.
                    result = await reader.read();
                }

                if (hasErrored) return;

                const finalChunk = decoder.decode();
                if (finalChunk.length > 0) {
                    parser.write(finalChunk);
                    hasWrittenText = true;
                }

                // 'csv-parse' fails when it is ended with nothing written, with '"listener" argument must be a function'. A
                // stream with no text is summarised here instead, and its parser is dropped without being ended.
                if (!hasWrittenText) {
                    parser.removeAllListeners();
                    parser = undefined;
                    resolve({ byteCount, commentLineCount: 0, emptyLineCount: 0, lineCount: 0, nonUniformRecordCount: 0, recordCount: 0 });
                    return;
                }
                parser.end();
            };

            void run().catch((error: unknown) => {
                handleError(error);
            });
        });
    }

    /**
     * Parse text. 'isComplete' says whether the text is the whole file rather than a preview of its start, so a quote
     * still open at its end is an error rather than a value the preview cut off.
     */
    async parseText(text: string, options: ParseTextOptions): Promise<ParseTextResult> {
        return await parseDelimitedText(text, options, parseTextWithDelimiter); // The choice of delimiter is shared, so every parser makes it the same way.
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────

//#region: Parse stream helpers.

/**
 * Construct record buffer.
 */
function constructRecordBuffer(bufferOptions: { chunk: (typeId: RecordRetrievalTypeId, records: ParsingRecord[]) => void | Promise<void>; chunkSize: number }): StreamRecordBuffer {
    const recordsPerChunk = Math.max(1, Math.floor(bufferOptions.chunkSize));
    const pool: ParsingRecord[][] = [];
    const pendingReceipts: Promise<void>[] = []; // The receiver's promises for chunks it is still working on.
    let records = allocateBuffer();
    let recordCount = 0;

    const flush = (): void => {
        if (recordCount === 0) return;
        const recordsToEmit = records;
        recordsToEmit.length = recordCount; // Trim before handing off so consumers only see populated entries.
        records = allocateBuffer();
        recordCount = 0;
        const receipt = bufferOptions.chunk('parsingRecordArray', recordsToEmit);
        if (receipt instanceof Promise) {
            pendingReceipts.push(receipt); // The receiver may still be reading the array, so it is not reused.
            return;
        }
        if (pool.length < DEFAULT_RECORD_BUFFER_POOL_SIZE) pool.push(recordsToEmit);
    };

    const drain = async (): Promise<void> => {
        while (pendingReceipts.length > 0) await Promise.all(pendingReceipts.splice(0));
    };

    const push = (record: ParsingRecord): void => {
        records[recordCount++] = record;
        if (recordCount >= recordsPerChunk) flush();
    };

    return { drain, flush, push };

    function allocateBuffer(): ParsingRecord[] {
        const pooled = pool.pop();
        if (pooled != null) {
            pooled.length = 0;
            return pooled;
        }

        const allocated = Array.from<ParsingRecord>({ length: recordsPerChunk });
        allocated.length = 0;
        return allocated;
    }
}

/** Construct summary. */
function constructSummary(parser: Parser | undefined): RetrieveRecordsSummary {
    return {
        byteCount: parser?.info.bytes ?? -1,
        commentLineCount: parser?.info.comment_lines ?? -1,
        emptyLineCount: parser?.info.empty_lines ?? -1,
        nonUniformRecordCount: parser?.info.invalid_field_length ?? -1,
        lineCount: parser?.info.lines ?? -1,
        recordCount: parser?.info.records ?? -1
    };
}

//#region: Parse text helpers.

// A record the parser cannot read is skipped and becomes an issue, so parsing carries on and finds every one. A preview
// cut short ends at a line break, which can fall inside a quoted value that spans lines. A quote still open at the end
// of such a preview is therefore not an issue. In a whole file it is one. Records are taken as each is parsed, from
// 'data' events, because those still buffered are lost when an error stops the parser. Each record reports the line it
// ends on, so an issue can say where its record starts: the parser itself only says where it found the problem, which
// for a quote never closed is the end of the text.
function parseTextWithDelimiter(text: string, delimiter: ValueDelimiterId, isComplete: boolean): Promise<{ issues: PreviewIssue[]; records: ParsingRecord[] }> {
    return new Promise((resolve) => {
        const issues: PreviewIssue[] = [];
        const records: ParsingRecord[] = [];
        let lastEndLineNumber = 0; // The line the last record, read or skipped, ends on.
        const addIssue = (error: ParseError | undefined): void => {
            if (error == null || (!isComplete && error.code === 'CSV_QUOTE_NOT_CLOSED')) return;
            issues.push(constructParseIssue(error, lastEndLineNumber + 1));
            if (error.lines != null) lastEndLineNumber = error.lines;
        };
        const parser = parse({
            ...DEFAULT_OPTIONS,
            cast: (value, context): { value: string; valueWasQuoted: boolean } => ({ value, valueWasQuoted: context.quoting }),
            delimiter,
            info: true,
            on_skip: (error): undefined => {
                addIssue(error);
            },
            relax_column_count: true,
            skip_records_with_error: true
        });
        parser.on('data', ({ info, record }: { info: { lines: number }; record: ParsingRecord }) => {
            records.push(record);
            lastEndLineNumber = info.lines;
        });
        // Only an error the parser cannot skip past, such as a bad option, ends here.
        parser.on('error', (error: ParseError) => {
            addIssue(error);
            resolve({ issues, records });
        });
        parser.on('end', () => {
            resolve({ issues, records });
        });
        parser.write(text);
        parser.end();
    });
}

// Everything the parser says about where the problem is. It counts fields from 0 and records already read, so both are
// moved on by one. An invalid closing quote names the character it met only in its message.
function constructParseIssue(error: ParseError, startLineNumber: number): PreviewIssue {
    const endLineNumber = error.lines;
    const closingQuoteCharacter = error.code === 'CSV_INVALID_CLOSING_QUOTE' ? /got "(.*?)" at line/u.exec(error.message)?.[1] : undefined;
    const value = typeof error.field === 'string' ? error.field : closingQuoteCharacter;
    return {
        endLineNumber: endLineNumber != null && endLineNumber > startLineNumber ? endLineNumber : undefined,
        fieldNumber: error.index == null ? undefined : error.index + 1,
        id: error.code ?? 'CSV_UNKNOWN_ERROR',
        lineNumber: endLineNumber == null ? undefined : Math.min(startLineNumber, endLineNumber),
        message: error.message,
        recordNumber: error.records == null ? undefined : error.records + 1,
        severityId: 'error',
        value: value != null && value.length > MAX_ISSUE_VALUE_LENGTH ? `${value.slice(0, MAX_ISSUE_VALUE_LENGTH)}…` : value
    };
}
