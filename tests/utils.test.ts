// 元々はテストコードを記述しながら開発するスタイルである TDD でやる予定でしたが、下記の事情により TDD による開発はしていません。
//     background.ts などの関数に export を追加するとここでテストできますが、公開時にエラーとなります（私が知らない良い解決策があるかもしれません）。
//     確かに、公開前は export を追加してテストし、export を削除してから公開するのが理想的ですが、関数の数が増えると現実的ではありません。
//     また、TDD はあくまでも開発における手段であり、TDD のためのテストコードを記述しなくても開発することは可能です（ソフトウェアとしての質が落ちることは否めないですが）。

import { getCurrentTimer } from '../src/scripts/utils';

describe("ポモドーロの開始時刻に関するテスト", () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date("2025-03-28T01:23:45").getTime());
    });

    it("現在時刻を取得できるかどうか", () => {
        const current = getCurrentTimer();
        const expected = { hour: 1, minute: 23, second: 45 };
        expect(current.hour).toEqual(expected.hour);
        expect(current.minute).toEqual(expected.minute);
        expect(current.second).toEqual(expected.second);
    });
});