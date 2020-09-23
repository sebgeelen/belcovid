import PolynomialRegression from 'js-polynomial-regression';

export const LINK_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json';
export const LINK_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json';
export const LINK_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json';
export const AVAILABLE_BEDS = 52565;
// source: https://www.healthybelgium.be/en/key-data-in-healthcare/general-hospitals/organisation-of-the-hospital-landscape/categorisation-of-hospital-activities/evolution-of-the-number-of-accredited-hospital-beds

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
    date = new Date(date); // clone to avoid side effects
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
export function getAverageOver(data, startDate, endDateOrInterval, key) {
    let endDate;
    if (typeof endDateOrInterval === 'number') {
        endDate = getDateFrom(startDate, endDateOrInterval);
    } else {
        endDate = endDateOrInterval;
    }
    if (endDate < startDate) {
        endDate = [startDate, startDate = endDate][0]; // swap them
    }
    let date = startDate;
    const values = [sumByKeyAtDate(data, date, key)];
    do {
        date = getDateFrom(date, +1);
        values.push(sumByKeyAtDate(data, date, key));
    } while (date && getIsoDate(date) < getIsoDate(endDate));
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
export function computeDaysBetween(day1, day2) {
    return (day1.getTime() - day2.getTime()) / (1000 * 60 * 60 * 24);
}
