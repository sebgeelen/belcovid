import PolynomialRegression from 'js-polynomial-regression';

export const TOTAL_BEDS = 52565;
// source: https://www.healthybelgium.be/en/key-data-in-healthcare/general-hospitals/organisation-of-the-hospital-landscape/categorisation-of-hospital-activities/evolution-of-the-number-of-accredited-hospital-beds

export const HOSPITALISATIONS_PER_YEAR = Math.round(1820000 * Math.pow(1 + 0.0102, 6));
// hospitalisations per year in 2014 * (1 + percentage average increase per year)^(2020 - 2014))
// source: https://kce.fgov.be/sites/default/files/atoms/files/T%C3%A9l%C3%A9charger%20la%20synth%C3%A8se%20en%20fran%C3%A7ais%20%2884%20p.%29.pdf

export const DAYS_PER_HOSPITALISATION = Math.round(6.99 * Math.pow(1 - 0.015, 6));
// days per hospitalisation in 2014 * (1 - percentage average decrease per year)^(2020 - 2014)
// source: https://kce.fgov.be/sites/default/files/atoms/files/T%C3%A9l%C3%A9charger%20la%20synth%C3%A8se%20en%20fran%C3%A7ais%20%2884%20p.%29.pdf

export const HOSPITAL_DAYS_PER_YEAR = HOSPITALISATIONS_PER_YEAR * DAYS_PER_HOSPITALISATION;
export const TAKEN_BEDS_PER_DAY = Math.round(HOSPITAL_DAYS_PER_YEAR / 365);
export const AVAILABLE_BEDS = TOTAL_BEDS - TAKEN_BEDS_PER_DAY;

export const TOTAL_ICU_BEDS = 2650;
// source: https://www.vrt.be/vrtnws/en/2020/03/22/health-minister-says-that-an-additional-759-intensive-care-beds/

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
export function getDaysBetween(day1, day2) {
    return Math.abs((day1.getTime() - day2.getTime()) / (1000 * 60 * 60 * 24));
}
export function today() {
    return new Date();
}
export function lastConsolidatedDataDay() {
    return getDateFrom(today(), -4);
}
