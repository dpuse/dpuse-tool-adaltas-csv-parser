// ── External Dependencies & Registrations
import { afterEach, describe, expect, it, vi } from 'vitest';

// ── Local Framework
import { Tool } from '@/index';

// ── Tests ────────────────────────────────────────────────────────────────────────────────────────────────────────────

const URL = 'https://sample-data-eu.dpuse.app/fileStore/people.csv';

function stubFetchText(text: string): void {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(text)));
}

function readValues(records: unknown[][]): string[][] {
    return records.map((record) => record.map((field) => (field as { value: string }).value));
}

describe('Tool', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe('parseText', () => {
        it('detects the value delimiter that splits every record evenly', async () => {
            const result = await new Tool().parseText('name;age\nAda;36\nGrace;85\n', [',', ';', '\t']);

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
            const result = await new Tool().parseText(text, [',', ';', '\t']);

            expect(result.valueDelimiterId).toBeUndefined();
        });

        it('allows a few ragged rows in delimited text', async () => {
            const result = await new Tool().parseText('name,age,city\nAda,36,London\nGrace,85\nKatherine,101,Hampton\n', [',', ';']);

            expect(result.valueDelimiterId).toBe(',');
        });

        it('keeps the records of text that is not delimited, so it can still be shown as a table', async () => {
            const result = await new Tool().parseText('Ada\nGrace\n', [',']);

            expect(result.valueDelimiterId).toBeUndefined();
            expect(readValues(result.parsedRecords)).toEqual([['Ada'], ['Grace']]);
        });

        it('reports a quote error that every delimiter meets', async () => {
            await expect(new Tool().parseText('a,b\nab"c,1\n', [',', ';'])).rejects.toThrow(/Invalid Opening Quote.*line 2/);
        });

        it('rules out a delimiter whose parse fails', async () => {
            const result = await new Tool().parseText('"x,y";1\n"z,w";2\n', [',', ';']);

            expect(result.valueDelimiterId).toBe(';');
            expect(readValues(result.parsedRecords)).toEqual([
                ['x,y', '1'],
                ['z,w', '2']
            ]);
        });

        it('keeps the records before a quoted value cut off at the end of the preview', async () => {
            const result = await new Tool().parseText('a,b\n1,2\n3,"multi\nline', [',']);

            expect(result.valueDelimiterId).toBe(',');
            expect(readValues(result.parsedRecords)).toEqual([
                ['a', 'b'],
                ['1', '2']
            ]);
        });

        it('reports a quote still open at the end of a whole file', async () => {
            await expect(new Tool().parseText('a,b\n1,2\n3,"never closed\n', [','], true)).rejects.toThrow(/Quote Not Closed/);
        });

        it('notes which values were quoted', async () => {
            const result = await new Tool().parseText('"a",b\n', [',']);

            expect(result.parsedRecords[0]).toEqual([
                { value: 'a', wasValueQuoted: true },
                { value: 'b', wasValueQuoted: false }
            ]);
        });

        it.each([
            ['\r\n', 'a\r\nb\r\nc'],
            ['\n', 'a\nb\nc'],
            ['\r', 'a\rb\rc']
        ])('detects %j as the record delimiter', async (recordDelimiterId, text) => {
            const result = await new Tool().parseText(text, [',']);
            expect(result.recordDelimiterId).toBe(recordDelimiterId);
        });
    });

    describe('parseStream', () => {
        it('stops with the parse error when a value holds a stray quote', async () => {
            stubFetchText('a,b\nab"c,1\n');

            await expect(new Tool().parseStream({ chunkSize: 10 } as never, {}, URL, new AbortController(), vi.fn())).rejects.toThrow(/Invalid Opening Quote/);
        });

        it('streams records in chunks of the requested size, then summarises them', async () => {
            stubFetchText('a,b\n1,2\n3,4\n5,6\n');
            const chunks: unknown[][][] = [];

            const summary = await new Tool().parseStream({ chunkSize: 2 } as never, {}, URL, new AbortController(), (typeId, records) => {
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

        // 'MacRoman' is the name jschardet reports; browsers only decode it as 'macintosh', where 0x8e is 'é'.
        it('decodes with the browser name for the encoding id', async () => {
            const macRomanBytes = new Uint8Array([0x63, 0x61, 0x66, 0x8e, 0x2c, 0x31, 0x0a]); // 'café,1' and a line break.
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(macRomanBytes)));
            const chunks: unknown[][][] = [];

            await new Tool().parseStream({ chunkSize: 10, encodingId: 'MacRoman' } as never, {}, URL, new AbortController(), (_typeId, records) => {
                chunks.push([...records]);
            });

            expect(chunks.map((records) => readValues(records))).toEqual([[['café', '1']]]);
        });

        it('rejects when the file cannot be fetched', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404, statusText: 'Not Found' })));
            const abortController = new AbortController();

            await expect(new Tool().parseStream({} as never, {}, URL, abortController, vi.fn())).rejects.toThrow(`Failed to fetch '${URL}' file.`);
            expect(abortController.signal.aborted).toBe(true);
        });

        it('rejects with the parser’s error when the content is invalid', async () => {
            stubFetchText('a,b\n1,2,3\n');

            await expect(new Tool().parseStream({} as never, {}, URL, new AbortController(), vi.fn())).rejects.toThrow('Invalid Record Length');
        });

        it('rejects when the operation is aborted before it starts reading', async () => {
            stubFetchText('a,b\n');
            const abortController = new AbortController();
            abortController.abort(new Error('Stopped.'));

            await expect(new Tool().parseStream({} as never, {}, URL, abortController, vi.fn())).rejects.toThrow('Stopped.');
        });
    });
});
