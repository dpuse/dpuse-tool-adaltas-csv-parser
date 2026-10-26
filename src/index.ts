// ── External Dependencies & Registrations
import { type Options, parse, type Parser } from 'csv-parse/browser/esm';
export type { Options, Parser } from 'csv-parse/browser/esm';

// ── DPUse Framework
import { buildFetchError, ignoreErrors, resolveDecoderId } from '@dpuse/dpuse-shared';
import type { ParsingRecord, PreviewIssue, RecordDelimiterId, RecordRetrievalTypeId, RetrieveRecordsOptions, RetrieveRecordsSummary, ValueDelimiterId } from '@dpuse/dpuse-shared';

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface ParseTextResult {
    issues: PreviewIssue[]; // Every record the parser could not read, in the order found. Empty when the text parsed cleanly.
    parsedRecords: ParsingRecord[];
    recordDelimiterId: RecordDelimiterId;
    valueDelimiterId: ValueDelimiterId | undefined; // Undefined when the text is not delimited.
}

type ParseError = Error & { code?: string; field?: unknown; index?: number; lines?: number; records?: number }; // The context csv-parse adds to an error.

interface StreamRecordBuffer {
    push: (record: ParsingRecord) => void;
    flush: () => void;
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

export class Tool {
    /**
     * Parse stream.
     */
    // TODO: An empty file fails here with '"listener" argument must be a function' rather than giving no rows. Seen in
    // a script reading 'Type Samples/people/people-empty.csv', not yet in the app, which has no full read until the
    // audit step is built. Reproduce it in this tool's tests first, then make an empty file give zero rows.
    async parseStream(
        retrieveRecordsOptions: RetrieveRecordsOptions,
        parseOptions: Options,
        url: string,
        abortController: AbortController,
        chunk: (typeId: RecordRetrievalTypeId, records: ParsingRecord[]) => void
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

            abortController.signal.addEventListener('abort', stopProcessing, { once: true });

            const handleError = (error: unknown): void => {
                if (hasErrored) return;

                hasErrored = true;
                stopProcessing();
                if (!abortController.signal.aborted) abortController.abort(error);
                reject(error instanceof Error ? error : new Error(String(error)));
            };

            const run = async (): Promise<void> => {
                parser = parse({
                    ...DEFAULT_OPTIONS,
                    ...parseOptions,
                    cast: (value, context): { value: string; wasValueQuoted: boolean } => ({ value, wasValueQuoted: context.quoting })
                });
                recordBuffer = constructRecordBuffer({ chunk, chunkSize: retrieveRecordsOptions.chunkSize ?? DEFAULT_RECORD_BUFFER_SIZE });
                parser.on('readable', () => {
                    try {
                        if (parser == null || recordBuffer == null) return;
                        let record: ParsingRecord | null;
                        while ((record = parser.read() as ParsingRecord | null) != null) {
                            if (hasErrored) return;
                            abortController.signal.throwIfAborted();
                            recordBuffer.push(record);
                        }
                    } catch (error) {
                        handleError(error);
                    }
                });
                parser.on('error', (error) => {
                    handleError(error);
                });
                parser.on('end', () => {
                    if (hasErrored) return;
                    recordBuffer?.flush();
                    resolve(constructSummary(parser));
                });

                const response = await fetch(encodeURI(url), { signal: abortController.signal });
                if (!response.ok || response.body == null) {
                    throw await buildFetchError(response, `Failed to fetch '${url}' file.`, 'dpuse-connector-file-store-emulator|Connector|retrieve');
                }

                reader = response.body.getReader();
                const decoder = new TextDecoder(resolveDecoderId(retrieveRecordsOptions.encodingId));
                let result = await reader.read();
                while (!result.done) {
                    if (hasErrored) return;
                    abortController.signal.throwIfAborted();
                    const decodedChunk = decoder.decode(result.value, { stream: true });
                    if (decodedChunk.length > 0) parser.write(decodedChunk);
                    result = await reader.read();
                }

                if (hasErrored) return;

                const finalChunk = decoder.decode();
                if (finalChunk.length > 0) parser.write(finalChunk);
                parser.end();
            };

            void run().catch((error: unknown) => {
                handleError(error);
            });
        });
    }

    /**
     * Parse text. 'isComplete' says whether the text is the whole file rather than a preview of its start, so a quote
     * still open at its end is an error rather than a value the preview cut off. Not complete by default.
     */
    async parseText(text: string, delimiters: ValueDelimiterId[], isComplete = false): Promise<ParseTextResult> {
        const recordDelimiterId = determineRecordDelimiter(text);
        const { issues, parsedRecords, valueDelimiterId } = await determineValueDelimiter(text, delimiters, isComplete);
        return { issues, parsedRecords, recordDelimiterId, valueDelimiterId };
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────

//#region: Parse stream helpers.

/**
 * Construct record buffer.
 */
function constructRecordBuffer(bufferOptions: { chunk: (typeId: RecordRetrievalTypeId, records: ParsingRecord[]) => void; chunkSize: number }): StreamRecordBuffer {
    const recordsPerChunk = Math.max(1, Math.floor(bufferOptions.chunkSize));
    const pool: ParsingRecord[][] = [];
    let records = allocateBuffer();
    let recordCount = 0;

    const flush = (): void => {
        if (recordCount === 0) return;
        const recordsToEmit = records;
        recordsToEmit.length = recordCount; // Trim before handing off so consumers only see populated entries.
        records = allocateBuffer();
        recordCount = 0;
        bufferOptions.chunk('parsingRecordArray', recordsToEmit);
        if (pool.length < DEFAULT_RECORD_BUFFER_POOL_SIZE) pool.push(recordsToEmit);
    };

    const push = (record: ParsingRecord): void => {
        records[recordCount++] = record;
        if (recordCount >= recordsPerChunk) flush();
    };

    return { flush, push };

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

/**
 * Determine record delimiter.
 */
function determineRecordDelimiter(text: string): RecordDelimiterId {
    const countCRLF = (text.match(/\r\n/g) ?? []).length; // Count all '\r\n'character sequences.
    const countLF = (text.match(/(?<!\r)\n/g) ?? []).length; // Count all '\n' characters not preceded by '\r' character.
    const countCR = (text.match(/\r(?!\n)/g) ?? []).length; // Count all '\r' characters not followed by '\n' character.
    if (countCRLF >= countLF && countCRLF >= countCR) return '\r\n';
    if (countLF >= countCRLF && countLF >= countCR) return '\n';
    return countCR >= countCRLF && countCR >= countLF ? '\r' : '\n'; // Ties, including text with no line break, go to '\r\n' above, so the '\n' here is never reached.
}

/**
 * Determine value delimiter. Undefined when the text is not delimited: the best delimiter found does not split most
 * records into the same number of values, more than one, as a table's rows would be. The records parsed with it are
 * still returned, so the text can be shown as a table if the user chooses. A delimiter whose parse has issues is only
 * used when every delimiter's does, because a wrong delimiter can itself cause a quote error. Then the one with the
 * fewest issues is used, the first on a tie, and its issues are returned, so the user learns why the text cannot be read.
 */
async function determineValueDelimiter(
    text: string,
    delimiters: ValueDelimiterId[],
    isComplete: boolean
): Promise<{ issues: PreviewIssue[]; parsedRecords: ParsingRecord[]; valueDelimiterId: ValueDelimiterId | undefined }> {
    let valueDelimiterId: ValueDelimiterId | undefined;
    let priorAverageCount: number | undefined;
    let priorSumCountDiffs: number | undefined;
    let parsedRecords: ParsingRecord[] = [];
    let fewestIssuesParse: { delimiter: ValueDelimiterId; issues: PreviewIssue[]; records: ParsingRecord[] } | undefined;
    let hasParsedWithoutIssues = false;

    /* TODO: Could improve performance by limiting the number of delimiters
       processed by exiting if column count is the same for each line and
       by ordering delimiters in most common usage. Could also consider
       parallel parsing. Maybe group by most common delimiters and then by
       less common? */

    for (const delimiter of delimiters) {
        const { issues, records } = await parseTextWithDelimiter(text, delimiter, isComplete);
        if (issues.length > 0) {
            fewestIssuesParse = chooseFewerIssues(fewestIssuesParse, { delimiter, issues, records });
            continue;
        }
        hasParsedWithoutIssues = true;
        if (records.length === 0) continue; // Nothing to compare, and the average below would be 0 / 0.
        const { averageValueCount, sumOfValueCountDiffs } = measureValueCounts(records);
        const isBetterFit = (!priorSumCountDiffs || sumOfValueCountDiffs <= priorSumCountDiffs) && (!priorAverageCount || averageValueCount > priorAverageCount);
        if (!isBetterFit) continue;
        valueDelimiterId = delimiter;
        priorAverageCount = averageValueCount;
        priorSumCountDiffs = sumOfValueCountDiffs;
        parsedRecords = records;
    }

    if (!hasParsedWithoutIssues && fewestIssuesParse != null) {
        const { delimiter, issues, records } = fewestIssuesParse;
        return { issues, parsedRecords: records, valueDelimiterId: isTabular(records) ? delimiter : undefined };
    }
    return { issues: [], parsedRecords, valueDelimiterId: valueDelimiterId != null && isTabular(parsedRecords) ? valueDelimiterId : undefined };
}

// The earlier parse wins a tie, so delimiters keep their order of preference.
function chooseFewerIssues<T extends { issues: PreviewIssue[] }>(priorParse: T | undefined, parse: T): T {
    return priorParse == null || parse.issues.length < priorParse.issues.length ? parse : priorParse;
}

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
            cast: (value, context): { value: string; wasValueQuoted: boolean } => ({ value, wasValueQuoted: context.quoting }),
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

// The average number of values per record, and how much that number changes from one record to the next.
function measureValueCounts(records: ParsingRecord[]): { averageValueCount: number; sumOfValueCountDiffs: number } {
    let totalValueCount = 0;
    let sumOfValueCountDiffs = 0;
    let priorValueCount: number | undefined;
    for (const record of records) {
        if (priorValueCount != null) sumOfValueCountDiffs += Math.abs(record.length - priorValueCount);
        priorValueCount = record.length;
        totalValueCount += record.length;
    }
    return { averageValueCount: totalValueCount / records.length, sumOfValueCountDiffs };
}

// Most records have the same number of values, more than one. Ragged rows are allowed, as the parser allows them.
function isTabular(parsedRecords: ParsingRecord[]): boolean {
    const recordCountByValueCount = new Map<number, number>();
    for (const record of parsedRecords) recordCountByValueCount.set(record.length, (recordCountByValueCount.get(record.length) ?? 0) + 1);
    const [commonValueCount = 0, commonRecordCount = 0] = [...recordCountByValueCount].toSorted((left, right) => right[1] - left[1])[0] ?? [];
    return commonValueCount > 1 && commonRecordCount * 2 > parsedRecords.length;
}
