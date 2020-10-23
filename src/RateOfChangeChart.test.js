const { default: RateOfChange } = require("./components/charts/RateOfChange");

describe('RateOfChangeChart', () => {
    const rateComponent = new RateOfChange();
    describe('_getChangeRatio', () => {
        test('should get a constant rate of 0%', () => {
            const data = [
                { x: 1, y: 1},
                { x: 1, y: 1},
                { x: 1, y: 1},
                { x: 1, y: 1},
                { x: 1, y: 1},
                { x: 1, y: 1},
                { x: 1, y: 1},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(0);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(0);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(0);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(0);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(0);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(0);
        });
        test('should get a constant rate of 100%', () => {
            const data = [
                { x: 1, y: 1},
                { x: 1, y: 2},
                { x: 1, y: 4},
                { x: 1, y: 8},
                { x: 1, y: 16},
                { x: 1, y: 32},
                { x: 1, y: 64},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(100);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(100);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(100);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(100);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(100);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(100);
        });
        test('should get a constant rate of -100%', () => {
            const data = [
                { x: 1, y: 64},
                { x: 1, y: 32},
                { x: 1, y: 16},
                { x: 1, y: 8},
                { x: 1, y: 4},
                { x: 1, y: 2},
                { x: 1, y: 1},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(-100);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(-100);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(-100);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(-100);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(-100);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(-100);
        });
        test('should get a constant rate of 50%', () => {
            const data = [
                { x: 1, y: 1},
                { x: 1, y: 1.5},
                { x: 1, y: 2.25},
                { x: 1, y: 3.375},
                { x: 1, y: 5.0625},
                { x: 1, y: 7.59375},
                { x: 1, y: 11.390625},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(50);
        });
        test('should get a constant rate of -50%', () => {
            const data = [
                { x: 1, y: 11.390625},
                { x: 1, y: 7.59375},
                { x: 1, y: 5.0625},
                { x: 1, y: 3.375},
                { x: 1, y: 2.25},
                { x: 1, y: 1.5},
                { x: 1, y: 1},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(-50);
        });
        test('should get a rate that constantly increases by 10%', () => {
            const data = [
                { x: 1, y: 1},
                { x: 1, y: 1.1},
                { x: 1, y: 1.32},
                { x: 1, y: 1.716},
                { x: 1, y: 2.4024},
                { x: 1, y: 3.6036},
                { x: 1, y: 5.76576},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(10);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(20);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(30);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(40);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(50);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(60);
        });
        test('should get a rate that constantly decreases by 10%', () => {
            const data = [
                { x: 1, y: 5.76576},
                { x: 1, y: 3.6036},
                { x: 1, y: 2.4024},
                { x: 1, y: 1.716},
                { x: 1, y: 1.32},
                { x: 1, y: 1.1},
                { x: 1, y: 1},
            ];
            expect(rateComponent._getChangeRatio(data[0].y, undefined)).toEqual(undefined);
            expect(rateComponent._getChangeRatio(data[1].y, data[0].y)).toEqual(-60);
            expect(rateComponent._getChangeRatio(data[2].y, data[1].y)).toEqual(-50);
            expect(rateComponent._getChangeRatio(data[3].y, data[2].y)).toEqual(-40);
            expect(rateComponent._getChangeRatio(data[4].y, data[3].y)).toEqual(-30);
            expect(rateComponent._getChangeRatio(data[5].y, data[4].y)).toEqual(-20);
            expect(rateComponent._getChangeRatio(data[6].y, data[5].y)).toEqual(-10);
        });
    });
});
