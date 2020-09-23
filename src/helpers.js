import PolynomialRegression from 'js-polynomial-regression';

export const LINK_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json';
export const LINK_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json';
export const LINK_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json';
export const AVAILABLE_BEDS = 61600;

export function getPolynomialRegressionPoints(data, degree = 1) {
    const regression = PolynomialRegression.read(data, degree);
        const terms = regression.getTerms();
        return data.map(point => {
            return {
                x: point.x,
                y: regression.predictY(terms, point.x),
            };
        });
}
export function getIsoDate(date) {
    return date.toISOString().substring(0, 10);
}
export function getDateFrom(date, daysFromDate) {
    const newDate = new Date(date.setDate(date.getDate() + daysFromDate));
    return newDate;
}
export function filterByDate(data, date) {
    return data.filter(item => item.DATE === getIsoDate(date));
}
export function sumByKey(data, key) {
    return data.map(item => item[key]).reduce((a, b) => a + b, 0);
}
export function sumByKeyAtDate(data, date, key) {
    const dataAtDate = filterByDate(data, date);
    return sumByKey(dataAtDate, key);
}
export function getAverageOver(data, startDate, endDate, key) {
    let date = startDate;
    const values = [sumByKeyAtDate(data, date, key)];
    do {
        date = getDateFrom(date, +1);
        values.push(sumByKeyAtDate(data, date, key));
    } while (date && getIsoDate(date) !== getIsoDate(endDate));
    return (values.length && values.reduce((a, b) => a + b, 0) / values.length) || 0;
}
export function getAveragePoints(points, interval) {
    return points.map((point, index) => {
        let y = 0;
        let n = 0;
        for (let i = 0; i < interval; i++) {
            if (index - i > 0 && points[index - i] !== undefined) {
                y += points[index - i].y;
                n++;
            }
        }
        y = y / (n || 1);
        if (!index) y = point.y;
        return {
            x: point.x,
            y,
        };
    });
}
