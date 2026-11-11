// ── External Dependencies & Registrations
import { type Options, parse, type Parser } from 'csv-parse/browser/esm';
export type { Options, Parser } from 'csv-parse/browser/esm';

// ── DPUse Framework
import { getValueDelimiterCharacter, ignoreErrors, parseDelimitedText, resolveDecoderId } from '@dpuse/dpuse-shared';
import type {
    ParsedRecord,
    ParsedRecordsChunk,
    ParserInterface,
    ParseStreamOptions,
    ParseStreamSummary,
    ParseTextOptions,
    ParseTextResult,
    SampleIssue,
    ValueDelimiterId
} from '@dpuse/dpuse-shared';

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────────

type ParseError = Error & { code?: string; field?: unknown; index?: number; lines?: number; records?: number }; // The context csv-parse adds to an error.

// What the parser has produced and not yet handed over. Its events add to it as it parses.
interface ParserOutput {
    error: Error | undefined;
    records: ParsedRecord[];
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

// WebKit hands over a file stream in pieces of about 18 MB, against about 2 MB in Chromium. Parsing a piece that large at
// once took the tab past 5 GB in WebKit, so each piece is parsed in slices of this size. A slice is a view, not a copy.
const MAX_SLICE_BYTE_COUNT = 1_048_576;

const MAX_ISSUE_VALUE_LENGTH = 50; // A value shown with an issue is cut short past this, because one never closed can run to the end of the text.

const DEFAULT_RECORD_BUFFER_SIZE = 10_000;

// ── Tools ────────────────────────────────────────────────────────────────────────────────────────────────────────────

export class Tool implements ParserInterface {
    /**
     * Parse stream. Reads delimited text from the stream. The caller owns the stream and its fetch, so a failed fetch is
     * the caller's to report. Aborting the signal stops the read and rejects with the signal's reason.
     */
    async *parseStream(stream: ReadableStream<Uint8Array>, options: ParseStreamOptions): AsyncGenerator<ParsedRecordsChunk, ParseStreamSummary, undefined> {
        options.abortSignal.throwIfAborted();
        const recordsPerChunk = Math.max(1, Math.floor(options.chunkSize ?? DEFAULT_RECORD_BUFFER_SIZE));
        const parser = parse({
            ...DEFAULT_OPTIONS,
            cast: (value, context): { value: string; valueWasQuoted: boolean } => ({ value, valueWasQuoted: context.quoting }),
            delimiter: getValueDelimiterCharacter(options.valueDelimiterId),
            relax_column_count: true
        });
        const output = collectParserOutput(parser);
        const reader = stream.getReader();
        // The stream may not be tied to the signal, so an abort cancels the read rather than waiting for the next piece.
        const cancelRead = (): void => {
            ignoreErrors(() => void reader.cancel(options.abortSignal.reason));
        };
        options.abortSignal.addEventListener('abort', cancelRead, { once: true });

        try {
            const decoder = new TextDecoder(resolveDecoderId(options.encodingId));
            let byteCount = 0;
            let hasWrittenText = false;
            let result = await reader.read();
            while (!result.done) {
                byteCount += result.value.length;
                for (let sliceStart = 0; sliceStart < result.value.length; sliceStart += MAX_SLICE_BYTE_COUNT) {
                    options.abortSignal.throwIfAborted();
                    const decodedSlice = decoder.decode(result.value.subarray(sliceStart, sliceStart + MAX_SLICE_BYTE_COUNT), { stream: true });
                    if (decodedSlice.length === 0) continue;
                    hasWrittenText = true;
                    if (!parser.write(decodedSlice) && output.error == null) await waitForParser(parser, 'drain'); // The parser's buffer is full, so the read waits until it empties.
                    yield* takeChunks(output, recordsPerChunk, options.abortSignal, false);
                }
                result = await reader.read();
            }
            options.abortSignal.throwIfAborted();

            const finalText = decoder.decode();
            if (finalText.length > 0) {
                parser.write(finalText);
                hasWrittenText = true;
            }
            // 'csv-parse' fails when it is ended with nothing written, with '"listener" argument must be a function'. A
            // stream with no text is summarised here instead, and its parser is dropped without being ended.
            if (!hasWrittenText) return { byteCount, commentLineCount: 0, emptyLineCount: 0, lineCount: 0, nonUniformRecordCount: 0, recordCount: 0 };
            parser.end();
            if (output.error == null) await waitForParser(parser, 'end');
            yield* takeChunks(output, recordsPerChunk, options.abortSignal, true);
            return constructSummary(parser);
        } finally {
            options.abortSignal.removeEventListener('abort', cancelRead);
            parser.removeAllListeners();
            ignoreErrors(() => void reader.cancel()); // Releases the item when the receiver stops before the end. A stream already read through ignores it.
        }
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

// Collects the records the parser has read, and its error if it fails. The 'readable' handler takes every record as soon
// as it is ready, so the parser's own buffer never fills while records wait to be handed over.
function collectParserOutput(parser: Parser): ParserOutput {
    const output: ParserOutput = { error: undefined, records: [] };
    parser.on('readable', () => {
        let record: ParsedRecord | null;
        while ((record = parser.read() as ParsedRecord | null) != null) output.records.push(record);
    });
    parser.on('error', (error) => {
        output.error = error;
    });
    return output;
}

// Hands over what the parser has read, a chunk at a time, or fails with its error. Only full chunks go until the text
// has all been parsed, then the rest goes too. The abort is checked before each chunk, because a receiver can abort
// between asking for one chunk and the next.
function* takeChunks(output: ParserOutput, recordsPerChunk: number, abortSignal: AbortSignal, isFinal: boolean): Generator<ParsedRecordsChunk> {
    if (output.error != null) throw output.error;
    while (output.records.length >= recordsPerChunk || (isFinal && output.records.length > 0)) {
        abortSignal.throwIfAborted();
        yield { records: output.records.splice(0, recordsPerChunk), typeId: 'parsingRecordArray' };
    }
}

// Settles when the parser emits the event, or fails. A parser that has already failed emits neither, so the caller checks
// for a failure before waiting, and again after.
function waitForParser(parser: Parser, eventName: 'drain' | 'end'): Promise<void> {
    return new Promise((resolve) => {
        const settle = (): void => {
            parser.removeListener(eventName, settle);
            parser.removeListener('error', settle);
            resolve();
        };
        parser.once(eventName, settle);
        parser.once('error', settle);
    });
}

/** Construct summary. */
function constructSummary(parser: Parser | undefined): ParseStreamSummary {
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
function parseTextWithDelimiter(text: string, delimiter: ValueDelimiterId, isComplete: boolean): Promise<{ issues: SampleIssue[]; records: ParsedRecord[] }> {
    return new Promise((resolve) => {
        const issues: SampleIssue[] = [];
        const records: ParsedRecord[] = [];
        let lastEndLineNumber = 0; // The line the last record, read or skipped, ends on.
        const addIssue = (error: ParseError | undefined): void => {
            if (error == null || (!isComplete && error.code === 'CSV_QUOTE_NOT_CLOSED')) return;
            issues.push(constructParseIssue(error, lastEndLineNumber + 1));
            if (error.code === 'CSV_INVALID_CLOSING_QUOTE') return; // The parser still holds the quote open, so its record has not ended.
            if (error.lines != null) lastEndLineNumber = error.lines;
        };
        const parser = parse({
            ...DEFAULT_OPTIONS,
            cast: (value, context): { value: string; valueWasQuoted: boolean } => ({ value, valueWasQuoted: context.quoting }),
            delimiter: getValueDelimiterCharacter(delimiter),
            info: true,
            on_skip: (error): undefined => {
                addIssue(error);
            },
            relax_column_count: true,
            skip_records_with_error: true
        });
        parser.on('data', ({ info, record }: { info: { lines: number }; record: ParsedRecord }) => {
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
function constructParseIssue(error: ParseError, startLineNumber: number): SampleIssue {
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
