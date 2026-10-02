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
