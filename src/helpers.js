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
/**
 * Return a string in the format 'YYYY-mm-dd' from a Date object.
 *
 * @param {Date} date
 * @returns {string}
 */
export function getIsoDate(date) {
    return date.toISOString().substring(0, 10);
}
/**
 * Return a Date object that is `daysFromDate` days from the given date.
 *
 * @param {Date} date
 * @param {number} daysFromDate
 * @returns {Date}
 */
export function getDateFrom(date, daysFromDate) {
    date = new Date(date); // clone to avoid side effects
    const newDate = new Date(date.setDate(date.getDate() + daysFromDate));
    return newDate;
}
/**
 * Return an array of objects filtered so as to keep only the objects that have
 * a 'DATE' property (as a string in the format 'YYYY-mm-dd') matching the given
 * date.
 *
 * @param {object[]} data
 * @param {Date} date
 * @returns {object[]}
 */
export function filterByDate(data, date) {
    return data.filter(item => item.DATE === getIsoDate(date));
}
/**
 * Return the sum of the numerical values on the given properties of each object
 * in an array.
 * Eg: `sumByKey([{a: 1, b: 0}, {a: 2, b: 3}], 'a')` will return 3.
 *
 * @param {object[]} data
 * @param {string} key
 * @returns {number}
 */
export function sumByKey(data, key) {
    return data.map(item => item[key]).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
}
/**
 * Return the sum of the numerical values on the given properties of each object
 * in an array that has a 'DATE' property (as a string in the format
 * 'YYYY-mm-dd') matching the given date.
 * Eg: `sumByKey([{a: 1, DATE: '2020-07-05'}, {a: 2}], new Date('2020-07-05'), 'a')` will return 1.
 *
 * @param {object[]} data
 * @param {Date} date
 * @param {string} key
 * @returns {number}
 */
export function sumByKeyAtDate(data, date, key) {
    const dataAtDate = filterByDate(data, date);
    return sumByKey(dataAtDate, key);
}
/**
 * Return the average over the given interval (as a number of days from a given
 * date or as a start and an end date) of the numerical values on the given
 * properties of each object in an array that has a 'DATE' property (as a string
 * in the format 'YYYY-mm-dd') matching the dates in the given interval.
 *
 * @param {object[]} data
 * @param {Date} startDate
 * @param {Date | number} endDateOrInterval
 * @param {string} key
 * @returns {number}
 */
export function getAverageOver(data, startDate, endDateOrInterval, key) {
    // Get the start and end dates of the interval.
    let endDate;
    if (typeof endDateOrInterval === 'number') {
        // We subtract 1 from the interval so as to average over `interval`
        // number of days (counting the start date).
        endDate = getDateFrom(startDate, endDateOrInterval - 1);
    } else {
        endDate = endDateOrInterval;
    }
    if (endDate < startDate) {
        endDate = [startDate, startDate = endDate][0]; // swap them
    }
    // Put the total value on each day in an array.
    let date = startDate;
    const values = [];
    do {
        // eslint-disable-next-line no-loop-func
        const hasValue = data.find(d => {
            return d.DATE === getIsoDate(date) && typeof d[key] === 'number';
        });
        if (hasValue) {
            // Only add to the array the dates that could be found in the data.
            values.push(sumByKeyAtDate(data, date, key));
        }
        date = getDateFrom(date, +1);
    } while (date && new Date(getIsoDate(date)) <= new Date(getIsoDate(endDate)));
    // Add up the values in the array and divide them by the number of days.
    return (values.length && values.reduce((a, b) => a + b, 0) / values.length) || 0;
}
/**
 * Return an array of objects of the form `{x: any, y: number}` where `x`
 * remains whatever it was for each object, and `y` is the average over
 * `interval` the given point and the `interval - 1` previous points in the
 * array.
 *
 * @param {object[]} points
 * @param {number} interval
 * @returns {object[]}
 */
export function getAveragePoints(points, interval) {
    return points.map((point, index) => {
        let y = 0;
        let n = 0;
        for (let i = 0; i < interval; i++) {
            if (index - i >= 0 && points[index - i] !== undefined) {
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
/**
 * Return the rounded number of days between two dates.
 *
 * @param {Date} day1
 * @param {Date} day2
 * @returns {number}
 */
export function getDaysBetween(day1, day2) {
    day1 = new Date(day1.toDateString());
    day2 = new Date(day2.toDateString());
    return Math.round(Math.abs((day1.getTime() - day2.getTime()) / (1000 * 60 * 60 * 24)));
}
/**
 * Return today's date.
 *
 * @returns {Date}
 */
export function today() {
    return new Date();
}
/**
 * Return the last day for which we can say that epidemiological data is
 * consolidated (ie. 4 days before today).
 *
 * @returns {Date}
 */
export function lastConsolidatedDataDay() {
    return getDateFrom(today(), -4);
}
