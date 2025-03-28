import { getCurrentTimer } from '../src/scripts/utils';

describe("ポモドーロの開始時刻に関するテスト", () => {
    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date("2025-03-28T01:23:45").getTime());
    });

    it('現在時刻を取得できるかどうか', () => {
        const current = getCurrentTimer();
        const expected = { hour: 1, minute: 23, second: 45 };
        expect(current.hour).toEqual(expected.hour);
        expect(current.minute).toEqual(expected.minute);
        expect(current.second).toEqual(expected.second);
    });
});