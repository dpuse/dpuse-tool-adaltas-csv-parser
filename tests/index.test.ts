// ── External Dependencies & Registrations
import { describe, expect, it, vi } from 'vitest';

// ── Local Framework
import { Tool } from '@/index';
import type { ParseStreamOptions, ValueDelimiterId } from '@dpuse/dpuse-shared';

// ── Tests ────────────────────────────────────────────────────────────────────────────────────────────────────────────

function parseText(text: string, valueDelimiterIds: ValueDelimiterId[], isComplete = false): ReturnType<Tool['parseText']> {
    return new Tool().parseText(text, { dataFormatId: 'dtv', isComplete, valueDelimiterIds });
}

function streamOf(content: string | Uint8Array): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
        start(controller): void {
            controller.enqueue(typeof content === 'string' ? new TextEncoder().encode(content) : content);
            controller.close();
        }
    });
}

function buildStreamOptions(overrides: Partial<ParseStreamOptions> = {}): ParseStreamOptions {
    return { abortSignal: new AbortController().signal, chunkSize: undefined, dataFormatId: 'dtv', encodingId: 'utf-8', valueDelimiterId: ',', ...overrides };
}

function readValues(records: unknown[][]): string[][] {
    return records.map((record) => record.map((field) => (field as { value: string }).value));
}

describe('Tool', () => {
    describe('parseText', () => {
        it('detects the value delimiter that splits every record evenly', async () => {
            const result = await parseText('name;age\nAda;36\nGrace;85\n', [',', ';', '\t']);

            expect(result.valueDelimiterId).toBe(';');
            expect(readValues(result.parsedRecords)).toEqual([
                ['name', 'age'],
                ['Ada', '36'],
                ['Grace', '85']
            ]);
        });

        it.each([
            ['prose with commas in some lines', 'The quick brown fox.\nIt jumped, then ran, then hid.\nThe end.\nNothing more to say, really.\n'],
            ['a single column of values', 'Ada\nGrace\nKatherine\n'],
            ['empty text', '']
        ])('reports %s as not delimited', async (_description, text) => {
            const result = await parseText(text, [',', ';', '\t']);

            expect(result.valueDelimiterId).toBeUndefined();
        });

        it('allows a few ragged rows in delimited text', async () => {
            const result = await parseText('name,age,city\nAda,36,London\nGrace,85\nKatherine,101,Hampton\n', [',', ';']);

            expect(result.valueDelimiterId).toBe(',');
        });

        it('keeps the records of text that is not delimited, so it can still be shown as a table', async () => {
            const result = await parseText('Ada\nGrace\n', [',']);

            expect(result.valueDelimiterId).toBeUndefined();
            expect(readValues(result.parsedRecords)).toEqual([['Ada'], ['Grace']]);
        });

        it('reports a quote error that every delimiter meets as an issue, keeping the records it could read', async () => {
            const result = await parseText('a,b\nab"c,1\n', [',', ';']);

            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]).toMatchObject({ id: 'INVALID_OPENING_QUOTE', lineNumber: 2, severityId: 'error' });
            expect(result.issues[0]?.message).toMatch(/Invalid Opening Quote/);
            expect(readValues(result.parsedRecords)).toEqual([['a', 'b']]);
        });

        it('reports every record it cannot read, not just the first', async () => {
            const result = await parseText('a,b\nab"c,1\nx,y\nd"e,2\n', [',']);

            expect(result.issues.map((issue) => issue.lineNumber)).toEqual([2, 4]);
            expect(readValues(result.parsedRecords)).toEqual([
                ['a', 'b'],
                ['x', 'y']
            ]);
        });

        it('reports no issues for text that parses cleanly', async () => {
            const result = await parseText('name;age\nAda;36\n', [',', ';']);

            expect(result.issues).toEqual([]);
        });

        it('rules out a delimiter whose parse fails', async () => {
            const result = await parseText('"x,y";1\n"z,w";2\n', [',', ';']);

            expect(result.valueDelimiterId).toBe(';');
            expect(readValues(result.parsedRecords)).toEqual([
                ['x,y', '1'],
                ['z,w', '2']
            ]);
        });

        it('keeps the records before a quoted value cut off at the end of the preview', async () => {
            const result = await parseText('a,b\n1,2\n3,"multi\nline', [',']);

            expect(result.issues).toEqual([]);
            expect(result.valueDelimiterId).toBe(',');
            expect(readValues(result.parsedRecords)).toEqual([
                ['a', 'b'],
                ['1', '2']
            ]);
        });

        it('reports a quote still open at the end of a whole file', async () => {
            const result = await parseText('a,b\n1,2\n3,"never closed\n', [','], true);

            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]).toMatchObject({ id: 'CSV_QUOTE_NOT_CLOSED', lineNumber: 3, severityId: 'error' });
            expect(result.issues[0]?.message).toMatch(/Quote Not Closed/);
        });

        it('reports a quote never closed from the line its record starts on to where parsing gave up', async () => {
            const result = await parseText('a,b\n1,2\n3,"multi\nline\n4,5\n', [','], true);

            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]).toMatchObject({ endLineNumber: 5, fieldNumber: 2, id: 'CSV_QUOTE_NOT_CLOSED', lineNumber: 3, recordNumber: 3 });
        });

        it('reports the value with an opening quote in it, and where it is', async () => {
            const result = await parseText('a,b\nx,ab"c\n1,2\n', [',']);

            expect(result.issues[0]).toMatchObject({ endLineNumber: undefined, fieldNumber: 2, lineNumber: 2, recordNumber: 2, value: 'ab' });
        });

        it('reports the character found after a closing quote', async () => {
            const result = await parseText('a,b\n1,"x"y\n', [','], true);

            expect(result.issues[0]).toMatchObject({ fieldNumber: 2, id: 'CSV_INVALID_CLOSING_QUOTE', lineNumber: 2, value: 'y' });
        });

        it('cuts a long value short', async () => {
            const result = await parseText(`a\n${'x'.repeat(60)}"y\n`, [',']);

            expect(result.issues[0]?.value).toBe(`${'x'.repeat(50)}…`);
        });

        it('notes which values were quoted', async () => {
            const result = await parseText('"a",b\n', [',']);

            expect(result.parsedRecords[0]).toEqual([
                { value: 'a', valueWasQuoted: true },
                { value: 'b', valueWasQuoted: false }
            ]);
        });

        it.each([
            ['\r\n', 'a\r\nb\r\nc'],
            ['\n', 'a\nb\nc'],
            ['\r', 'a\rb\rc']
        ])('detects %j as the record delimiter', async (recordDelimiterId, text) => {
            const result = await parseText(text, [',']);
            expect(result.recordDelimiterId).toBe(recordDelimiterId);
        });
    });

    describe('parseStream', () => {
        it('stops with the parse error when a value holds a stray quote', async () => {
            await expect(new Tool().parseStream(streamOf('a,b\nab"c,1\n'), buildStreamOptions({ chunkSize: 10 }), vi.fn())).rejects.toThrow(/Invalid Opening Quote/);
        });

        it('streams records in chunks of the requested size, then summarises them', async () => {
            const chunks: unknown[][][] = [];

            const summary = await new Tool().parseStream(streamOf('a,b\n1,2\n3,4\n5,6\n'), buildStreamOptions({ chunkSize: 2 }), (typeId, records) => {
                expect(typeId).toBe('parsingRecordArray');
                chunks.push([...records]);
            });

            expect(chunks.map((records) => readValues(records))).toEqual([
                [
                    ['a', 'b'],
                    ['1', '2']
                ],
                [
                    ['3', '4'],
                    ['5', '6']
                ]
            ]);
            expect(summary).toEqual({ byteCount: 16, commentLineCount: 0, emptyLineCount: 1, lineCount: 5, nonUniformRecordCount: 0, recordCount: 4 });
        });

        it('splits values with the delimiter it is given', async () => {
            const chunks: unknown[][][] = [];

            await new Tool().parseStream(streamOf('a;b\n1;2\n'), buildStreamOptions({ valueDelimiterId: ';' }), (_typeId, records) => {
                chunks.push([...records]);
            });

            expect(chunks.map((records) => readValues(records))).toEqual([
                [
                    ['a', 'b'],
                    ['1', '2']
                ]
            ]);
        });

        it('notes which values were quoted', async () => {
            const chunks: unknown[][][] = [];

            await new Tool().parseStream(streamOf('"a",b\n'), buildStreamOptions(), (_typeId, records) => {
                chunks.push([...records]);
            });

            expect(chunks[0]?.[0]).toEqual([
                { value: 'a', valueWasQuoted: true },
                { value: 'b', valueWasQuoted: false }
            ]);
        });

        // 'macroman' is jschardet's 'MacRoman' in lower case; browsers only decode it as 'macintosh', where 0x8e is 'é'.
        it('decodes with the browser name for the encoding id', async () => {
            const macRomanBytes = new Uint8Array([0x63, 0x61, 0x66, 0x8e, 0x2c, 0x31, 0x0a]); // 'café,1' and a line break.
            const chunks: unknown[][][] = [];

            await new Tool().parseStream(streamOf(macRomanBytes), buildStreamOptions({ chunkSize: 10, encodingId: 'macroman' }), (_typeId, records) => {
                chunks.push([...records]);
            });

            expect(chunks.map((records) => readValues(records))).toEqual([[['café', '1']]]);
        });

        it('counts records with a different number of values rather than failing, so an audit can report them', async () => {
            const summary = await new Tool().parseStream(streamOf('a,b\n1,2,3\n4,5\n'), buildStreamOptions(), vi.fn());

            expect(summary).toMatchObject({ nonUniformRecordCount: 1, recordCount: 3 });
        });

        it('reads an empty stream as no records', async () => {
            const chunk = vi.fn();

            const summary = await new Tool().parseStream(streamOf(''), buildStreamOptions(), chunk);

            expect(chunk).not.toHaveBeenCalled();
            expect(summary.recordCount).toBe(0);
        });

        it('rejects with the signal’s reason when the operation is aborted before it starts reading', async () => {
            const abortController = new AbortController();
            abortController.abort(new Error('Stopped.'));

            await expect(new Tool().parseStream(streamOf('a,b\n'), buildStreamOptions({ abortSignal: abortController.signal }), vi.fn())).rejects.toThrow('Stopped.');
        });

        it('rejects with the signal’s reason and cancels the stream when aborted while reading, even if the stream is not tied to the signal', async () => {
            const cancel = vi.fn();
            const stream = new ReadableStream<Uint8Array>({
                start(controller): void {
                    controller.enqueue(new TextEncoder().encode('a,b\n1,2\n')); // Then never ends.
                },
                cancel
            });
            const abortController = new AbortController();
            const chunk = vi.fn(() => {
                abortController.abort(new Error('Stopped.'));
            });

            await expect(new Tool().parseStream(stream, buildStreamOptions({ abortSignal: abortController.signal, chunkSize: 1 }), chunk)).rejects.toThrow('Stopped.');
            expect(cancel).toHaveBeenCalled();
        });
    });
});
