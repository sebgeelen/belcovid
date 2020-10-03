const { default: RateOfChangeChart } = require("./components/charts/RateOfChangeChart");

describe('RateOfChangeChart', () => {
    const rateComponent = new RateOfChangeChart({ startWeek: 1});
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
    });
});
