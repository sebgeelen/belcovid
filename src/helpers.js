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
