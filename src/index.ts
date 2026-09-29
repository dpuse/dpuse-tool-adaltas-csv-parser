// ── External Dependencies & Registrations
import { type Options, parse, type Parser } from 'csv-parse/browser/esm';
export type { Options, Parser } from 'csv-parse/browser/esm';

// ── DPUse Framework
import { buildFetchError, ignoreErrors } from '@dpuse/dpuse-shared';
import type { ParsingRecord, RecordDelimiterId, RecordRetrievalTypeId, RetrieveRecordsOptions, RetrieveRecordsSummary, ValueDelimiterId } from '@dpuse/dpuse-shared';

// ── Types ────────────────────────────────────────────────────────────────────────────────────────────────────────────

export interface ParseTextResult {
    parsedRecords: ParsingRecord[];
    recordDelimiterId: RecordDelimiterId;
    valueDelimiterId: ValueDelimiterId;
}

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
    relax_quotes: false,
    rtrim: false,
    skip_empty_lines: false,
    skip_records_with_empty_values: false,
    skip_records_with_error: false,
    to_line: -1,
    trim: false
};

const DEFAULT_RECORD_BUFFER_POOL_SIZE = 4;

const DEFAULT_RECORD_BUFFER_SIZE = 10_000;

// ── Tools ────────────────────────────────────────────────────────────────────────────────────────────────────────────

export class Tool {
    /**
     * Parse stream.
     */
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
                const decoder = new TextDecoder(retrieveRecordsOptions.encodingId);
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
     * Parse text.
     */
    async parseText(text: string, delimiters: ValueDelimiterId[]): Promise<ParseTextResult> {
        const recordDelimiterId = determineRecordDelimiter(text);
        const { parsedRecords, valueDelimiterId } = await determineValueDelimiter(text, delimiters);
        return { parsedRecords, recordDelimiterId, valueDelimiterId };
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
    if (countCR >= countCRLF && countCR >= countLF) return '\r';
    return '\n'; // Default to '\n' character if all counts are equal or zero.
}

/**
 * Determine value delimiter.
 */
async function determineValueDelimiter(text: string, delimiters: ValueDelimiterId[]): Promise<{ parsedRecords: ParsingRecord[]; valueDelimiterId: ValueDelimiterId }> {
    let valueDelimiterId: ValueDelimiterId | undefined;
    let priorAverageCount: number;
    let priorSumCountDiffs: number;
    let parsedRecords: ParsingRecord[] = [];

    /* TODO: Could improve performance by limiting the number of delimiters
       processed by exiting if column count is the same for each line and
       by ordering delimiters in most common usage. Could also consider
       parallel parsing. Maybe group by most common delimiters and then by
       less common? */

    for (const delimiter of delimiters) {
        try {
            let totalValueCount = 0;
            let priorValueCount: number | undefined;
            let recordCount = 0;
            let sumOfValueCountDiffs = 0;

            const parser = parse({
                ...DEFAULT_OPTIONS,
                cast: (value, context): { value: string; wasValueQuoted: boolean } => ({ value, wasValueQuoted: context.quoting }),
                delimiter,
                relax_column_count: true
            });
            await new Promise<void>((resolve): void => {
                try {
                    const pendingRecords: ParsingRecord[] = [];
                    parser.on('readable', (): void => {
                        let record;
                        while ((record = parser.read() as ParsingRecord | null) != null) {
                            recordCount++;
                            const valueCount = record.length;
                            if (priorValueCount != null) sumOfValueCountDiffs += Math.abs(valueCount - priorValueCount);
                            priorValueCount = valueCount;
                            totalValueCount += valueCount;
                            pendingRecords.push(record);
                        }
                    });
                    parser.on('error', (): void => {
                        resolve(); // Ignore errors. Assume invalid delimiter caused parsing error.
                    });
                    parser.on('end', (): void => {
                        const averageValueCount = totalValueCount / recordCount;
                        if ((!priorSumCountDiffs || sumOfValueCountDiffs <= priorSumCountDiffs) && (!priorAverageCount || averageValueCount > priorAverageCount)) {
                            valueDelimiterId = delimiter;
                            priorAverageCount = averageValueCount;
                            priorSumCountDiffs = sumOfValueCountDiffs;
                            parsedRecords = [...pendingRecords];
                        }
                        resolve();
                    });
                    parser.write(text);
                    parser.end();
                } catch {
                    resolve(); // Ignore errors. Assume invalid delimiter caused parsing error.
                }
            });
        } catch {
            // Ignore errors. Assume invalid delimiter caused parsing error.
        }
    }

    return { parsedRecords, valueDelimiterId: valueDelimiterId ?? ',' };
}
