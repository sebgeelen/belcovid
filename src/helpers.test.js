import {
    getIsoDate,
    getDateFrom,
    filterByDate,
    sumByKey,
    sumByKeyAtDate,
    getAverageOver,
    getAveragePoints,
    getDaysBetween,
    today,
    lastConsolidatedDataDay
} from './helpers.js';

describe('helpers', () => {
    describe('getIsoDate', () => {
        test('should get an iso date without time', () => {
            expect(getIsoDate(new Date('2020-05-07'))).toEqual('2020-05-07');
        });
    });
    describe('getDateFrom', () => {
        test('should get a date 5 days before the given date', () => {
            expect(getDateFrom(new Date('2020-05-07'), -5)).toEqual(new Date('2020-05-02'));
        });
        test('should get the given date', () => {
            expect(getDateFrom(new Date('2020-05-07'), 0)).toEqual(new Date('2020-05-07'));
        });
        test('should get a date 5 days after the given date', () => {
            const date = new Date('2020-05-07');
            expect(getDateFrom(date, 5)).toEqual(new Date('2020-05-12'));
            // The date should not be modified in place so we should get the
            // same result if we call it again.
            expect(getDateFrom(date, 5)).toEqual(new Date('2020-05-12'));
        });
    });
    describe('filterByDate', () => {
        test('should return an empty array', () => {
            expect(filterByDate([], new Date())).toEqual([]);
            expect(filterByDate([{ DATE: '2020-05-07'}], new Date())).toEqual([]);
        });
        test('should return an array of one object (exclude the other)', () => {
            const data = [
                { DATE: '2020-05-07' },
                { DATE: '2020-05-06' },
            ];
            expect(filterByDate(data, new Date('2020-05-07'))).toEqual([{ DATE: '2020-05-07' }]);
        });
        test('should return an array of two objects (keeping them all)', () => {
            const data = [
                { DATE: '2020-05-07', a: 'a' },
                { DATE: '2020-05-07', b: 'b' },
            ];
            expect(filterByDate(data, new Date('2020-05-07'))).toEqual(data);
        });
        test("should ignore data with no 'DATE' property", () => {
            const data = [
                { DATE: '2020-05-07' },
                { a: 'a' },
            ];
            expect(filterByDate(data, new Date('2020-05-07'))).toEqual([{ DATE: '2020-05-07' }]);
        });
    });
    describe('sumByKey', () => {
        test('should add together number properties on objects in an array', () => {
            const data = [
                { a: 1, b: 2.5 },
                { a: 5, b: 9, c: 19 },
            ];
            expect(sumByKey(data, 'a')).toBe(6);
            expect(sumByKey(data, 'b')).toBe(11.5);
            expect(sumByKey(data, 'c')).toBe(19);
        });
    });
    describe('sumByKeyAtDate', () => {
        test('should return 0', () => {
            const data = [
                { a: 1, b: 2, c: 19, DATE: '2020-05-06' },
                { a: 5, b: 9 },
            ];
            expect(sumByKeyAtDate(data, new Date('2020-05-07'), 'c')).toBe(0);
        });
        test('should return the numbervalue of a property', () => {
            const data = [
                { a: 1, b: 2, c: 19.5, DATE: '2020-05-07' },
                { a: 5, b: 9, c: 20.4 },
                { a: 5, b: 9, c: 31.8, DATE: '2020-05-06' },
            ];
            expect(sumByKeyAtDate(data, new Date('2020-05-07'), 'c')).toBe(19.5);
        });
        test('should add together number properties on objects in an array', () => {
            const data = [
                { a: 1, b: 2, c: 19.5, DATE: '2020-05-07' },
                { a: 5, b: 9, DATE: '2020-05-07' },
                { a: 5, b: 9, c: 42, DATE: '2020-05-07' },
            ];
            expect(sumByKeyAtDate(data, new Date('2020-05-07'), 'c')).toBe(61.5);
        });
    });
    describe('getAverageOver', () => {
        test('should return 0', () => {
            const data = [
                { a: 1, b: 2, c: 19, DATE: '2020-05-06' },
                { a: 5, b: 9 },
            ];
            expect(getAverageOver(data, new Date('2020-05-07'), 3, 'c')).toBe(0);
            expect(getAverageOver(data, new Date('2020-05-06'), 3, 'd')).toBe(0);
        });
        test('should compute an average over 7 days, where those days are all available', () => {
            const data = [
                { a: 1, b: 2, c: 19, d: 0.5, DATE: '2020-05-06' },
                { a: 2, b: 4, c: 19, d: -0.5, DATE: '2020-05-07' },
                { a: 3, b: 6, c: 19, d: 0.5, DATE: '2020-05-08' },
                { a: 4, b: 8, c: 19, d: -0.5, DATE: '2020-05-09' },
                { a: 5, b: 10, c: 19, d: 0.5, DATE: '2020-05-09' },
                { a: 6, b: 12, c: 19, DATE: '2020-05-10' },
                { a: 7, b: 14, c: 19, d: 0.5, DATE: '2020-05-11' },
                { a: 8, b: 16, c: 19, d: -0.5, DATE: '2020-05-12' },
                { a: 9, b: 18, c: 19, d: 0.5, DATE: '2020-05-13' },
            ];
            const resultA = (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8) / 7;
            const resultB = (2 + 4 + 6 + 8 + 10 + 12 + 14 + 16) / 7;
            const resultC = (19 * 8) / 7;
            const resultD = 0.5 / 6;
            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'a')).toBe(resultA);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'b')).toBe(resultB);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'c')).toBe(resultC);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'd')).toBe(resultD);
        });
        test("should compute an average over 7 days, where those days aren't all available", () => {
            const data = [
                { a: 1, b: 2, c: 19, d: 0.5, DATE: '2020-05-06' },
                { a: 2, b: 4, c: 19, d: -0.5, DATE: '2020-05-07' },
                { a: 3, b: 6, c: 19, DATE: '2020-05-08' },
                { a: 4, b: 8, c: 19, d: -0.5, DATE: '2020-05-09' },
                { a: 8, b: 16, c: 19, d: -0.5, DATE: '2020-05-12' },
            ];
            const resultA = (1 + 2 + 3 + 4 + 8) / 5;
            const resultB = (2 + 4 + 6 + 8 + 16) / 5;
            const resultC = (19 * 5) / 5;
            const resultD = -1 / 4;
            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'a')).toBe(resultA);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'a')).toBe(resultA);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'b')).toBe(resultB);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'b')).toBe(resultB);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'c')).toBe(resultC);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'c')).toBe(resultC);

            expect(getAverageOver(data, new Date('2020-05-06'), 7, 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-12'), -7, 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-06'), new Date('2020-05-12'), 'd')).toBe(resultD);
            expect(getAverageOver(data, new Date('2020-05-12'), new Date('2020-05-06'), 'd')).toBe(resultD);
        });
    });
    describe('getAveragePoints', () => {
        test('should return the array unchanged', () => {
            const data = [{ x: 1, y: 5 }];
            expect(getAveragePoints(data, 0)).toEqual(data);
            expect(getAveragePoints(data, 1)).toEqual(data);
        });
        test('should return the array with the correct averages', () => {
            const data = [
                { x: 1, y: 1},
                { x: 1, y: 2},
                { x: 1, y: 3},
                { x: 1, y: 4},
                { x: 1, y: 5},
            ];
            expect(getAveragePoints(data, 2)).toEqual([
                { x: 1, y: 1 },
                { x: 1, y: 3 / 2 },
                { x: 1, y: 5 / 2 },
                { x: 1, y: 7 / 2 },
                { x: 1, y: 9 / 2 },
            ]);
            expect(getAveragePoints(data, 3)).toEqual([
                { x: 1, y: 1 },
                { x: 1, y: 3 / 2 },
                { x: 1, y: 6 / 3 },
                { x: 1, y: 9 / 3 },
                { x: 1, y: 12 / 3 },
            ]);
            expect(getAveragePoints(data, 4)).toEqual([
                { x: 1, y: 1 },
                { x: 1, y: 3 / 2 },
                { x: 1, y: 6 / 3 },
                { x: 1, y: 10 / 4 },
                { x: 1, y: 14 / 4 },
            ]);
            expect(getAveragePoints(data, 5)).toEqual([
                { x: 1, y: 1 },
                { x: 1, y: 3 / 2 },
                { x: 1, y: 6 / 3 },
                { x: 1, y: 10 / 4 },
                { x: 1, y: 15 / 5 },
            ]);
            expect(getAveragePoints(data, 6)).toEqual([
                { x: 1, y: 1 },
                { x: 1, y: 3 / 2 },
                { x: 1, y: 6 / 3 },
                { x: 1, y: 10 / 4 },
                { x: 1, y: 15 / 5 },
            ]);
        });
    });
    describe('getDaysBetween', () => {
        test('should return 0', () => {
            expect(getDaysBetween(new Date(), new Date())).toBe(0);
        });
        test('should find a difference of a (leap) year', () => {
            expect(getDaysBetween(new Date('2019-05-07'), new Date('2020-05-07'))).toBe(366);
            expect(getDaysBetween(new Date('2020-05-07'), new Date('2019-05-07'))).toBe(366);
            expect(getDaysBetween(new Date('2018-05-07'), new Date('2019-05-07'))).toBe(365);
            expect(getDaysBetween(new Date('2019-05-07'), new Date('2018-05-07'))).toBe(365);
        });
    });
    describe('today', () => {
        test('should return today', () => {
            expect(today()).toEqual(new Date());
        });
    });
    describe('lastConsolidatedDay', () => {
        test('should return 4 days before today', () => {
            expect(lastConsolidatedDataDay()).toEqual(getDateFrom(new Date(), -4));
        });
    });
});
