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

export const testingAnnotations = [{
    type: 'line',
    mode: 'vertical',
    scaleID: 'x-axis-0',
    value: new Date('2020-10-19'),
    borderColor: 'grey',
    borderDash: [10, 10],
    borderWidth: .5,
    label: {
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        fontColor: 'black',
        content: 'Testing strategy change',
        enabled: true,
        fontSize: 9,
        fontStyle: 'normal',
        position: 'top',
    },
}];

export function getPolynomialRegressionPoints(data, degree = 2) {
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
    return normalizeDate(newDate);
}
/**
 * Return a new date object with the same date as the given date object, but no
 * time.
 *
 * @param {Date} date
 * @returns {Date}
 */
export function normalizeDate(date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
}
/**
 * Return true if the two given dates are the same, ignoring time.
 *
 * @param {Date} date
 * @param {Date} otherDate
 * @returns {boolean}
 */
export function areDateSame(date, otherDate) {
    return normalizeDate(date).getTime() === normalizeDate(otherDate).getTime();
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
 * Return the average over the given interval (as a number of days from a given
 * date or as a start and an end date) of the numerical values of each object in
 * an array that has a 'DATE' property (as a string in the format 'YYYY-mm-dd')
 * matching the dates in the given interval.
 *
 * @param {object[]} data
 * @param {Date} startDate
 * @param {Date | number} endDateOrInterval
 * @param {string} [ageGroup]
 * @returns {number}
 */
export function getAverageOver(data, startDate, endDateOrInterval, ageGroup) {
    // Get the start and end dates of the interval.
    let endDate;
    if (typeof endDateOrInterval === 'number') {
        // We subtract 1 from the interval so as to average over `interval`
        // number of days (counting the start date).
        const interval = endDateOrInterval > 0 ? endDateOrInterval - 1 : endDateOrInterval + 1;
        endDate = getDateFrom(startDate, interval);
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
        let value = data[getIsoDate(date)];
        if (typeof value === 'object') {
            value = value[ageGroup || 'total'];
        }
        const hasValue = typeof value === 'number';
        if (hasValue) {
            // Only add to the array the dates that could be found in the data.
            values.push(value);
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
                const newY = points[index - i].y;
                if (typeof newY === 'number') {
                    y += newY;
                    n++;
                }
            }
        }
        y = y / (n || 1);
        if (!index) y = typeof point.y === 'number' ? point.y : undefined;
        return {
            x: point.x,
            y,
        };
    }).filter(p => p && typeof p.y === 'number');
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
    return normalizeDate(new Date());
}
/**
 * Return yesterday's date.
 *
 * @returns {Date}
 */
export function yesterday() {
    return getDateFrom(today(), -1);
}
/**
 * Return the last day for which we can say that epidemiological data is
 * consolidated (ie. 4 days before today).
 *
 * @returns {Date}
 */
export function lastConsolidatedDataDay() {
    return getDateFrom(today(), -3);
}
const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
export function prettyDate(date, withTime = false) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return `${months[date.getMonth()]} ${date.getDate()}${
        withTime
            ? ` at ${(date.getHours() + '').length === 1 ? `0${date.getHours()}` : date.getHours()}:${
                (date.getMinutes() + '').length === 1 ? `0${date.getMinutes()}` : date.getMinutes()}:${
                (date.getSeconds() + '').length === 1 ? `0${date.getSeconds()}` : date.getSeconds()}`
            : ''
    }`;
}
export function betterRound(n) {
    let absN = Math.abs(n);
    if (absN < 0.01) {
        n = Math.round(n * 10000) / 10000;
    } else if (absN < 0.1) {
        n = Math.round(n * 1000) / 1000;
    } else if (absN < 1) {
        n = Math.round(n * 100) / 100;
    } else if (absN < 10) {
        n = Math.round(n * 10) / 10;
    } else {
        n = Math.round(n);
    }
    return n;
}
export function isMobile(tabletIncluded = true) {
    if (tabletIncluded) {
        return window.innerWidth <= 600;
    } else {
        return window.innerWidth <= 400;
    }
}
export function getFromLocalStorage(name) {
    return window.localStorage?.getItem(name);
}
export function setIntoLocalStorage(name, value) {
    try {
        if (window.localStorage) {
            window.localStorage.setItem(name, value);
        }
    } catch (e) {
        console.warn(e);
    }
}
/**
 * Return the change ratio between two numerical values, in percentage.
 *
 * @param {number} newValue
 * @param {number} oldValue
 * @returns {number}
 */
export function getChangeRatio(newValue, oldValue) {
    if (oldValue === newValue) {
        return 0;
    } else if (!oldValue) {
        // If we come from 0 and get to a different value, the rate of
        // change is undefined.
        return;
    } else if (newValue > oldValue) {
        return betterRound(100 * ((newValue / oldValue) - 1));
    } else {
        // If the value went down, the result should be negative.
        return betterRound(-100 * ((oldValue / newValue) - 1));
    }
}
/**
 * Return an object with the given `keys`, all set to the given `initalValue`.
 *
 * @param {string[]} keys
 * @param {any} [initialValue] default: undefined
 */
export function objectFrom(keys, initialValue) {
    return keys.reduce((object, key) => {
        const value = Array.isArray(initialValue)
            ? [...initialValue] :
            (
                typeof initialValue === 'object'
                    ? {...initialValue}
                    : initialValue
            );
        object[key] = value;
        return object;
    }, {});
}
/**
 * Take a datetime string representing the time of fetching Sciensano data, and
 * return true if that data is expired.
 *
 * @param {string} lastUpdateTime
 * @returns {boolean}
 */
export function isExpired(lastUpdateTime) {
    let isExpired = false;
    if (lastUpdateTime) {
        const daysSinceLastUpdate = getDaysBetween(new Date(lastUpdateTime), today());
        const lastUpdateHour = new Date(lastUpdateTime).getHours();
        const currentHour = new Date().getHours();
        // belcovid-db updates every day at 6am and 6pm.
        isExpired = daysSinceLastUpdate !== 0 ||
            (currentHour >= 6 && lastUpdateHour < 6) ||
            (currentHour >= 18 && lastUpdateHour < 18);
    }
    return isExpired;
}
