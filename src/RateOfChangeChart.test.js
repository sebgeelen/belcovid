const { default: RateOfChangeChart } = require("./components/charts/RateOfChangeChart");

describe('RateOfChangeChart', () => {
    const rateComponent = new RateOfChangeChart();
    describe('_getRateOfChangePoint', () => {
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: 0});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: 100});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: 100});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: 100});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: 100});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: 100});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: 100});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: -100});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: -100});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: -100});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: -100});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: -100});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: -100});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: 50});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: -50});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: 10});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: 20});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: 30});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: 40});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: 50});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: 60});
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
            expect(rateComponent._getRateOfChangePoint(data, 0, 2)).toEqual({ x: 1, y: 0});
            expect(rateComponent._getRateOfChangePoint(data, 1, 2)).toEqual({ x: 1, y: -60});
            expect(rateComponent._getRateOfChangePoint(data, 2, 2)).toEqual({ x: 1, y: -50});
            expect(rateComponent._getRateOfChangePoint(data, 3, 2)).toEqual({ x: 1, y: -40});
            expect(rateComponent._getRateOfChangePoint(data, 4, 2)).toEqual({ x: 1, y: -30});
            expect(rateComponent._getRateOfChangePoint(data, 5, 2)).toEqual({ x: 1, y: -20});
            expect(rateComponent._getRateOfChangePoint(data, 6, 2)).toEqual({ x: 1, y: -10});
        });
    });
});
