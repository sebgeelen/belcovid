import { lastConsolidatedDataDay } from "./helpers";


const URL_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json';
const URL_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json';
const URL_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json';
const URL_MORTALITY = 'https://epistat.sciensano.be/Data/COVID19BE_MORT.json';

const urls = {
    hospitalisations: URL_HOSPI,
    tests: URL_TOTAL_TESTS,
    cases: URL_CASES,
    mortality: URL_MORTALITY,
};
export async function fetchData(key, filtered = true) {
    const url = urls[key];
    return url && (await fetch(url)).json();
}
export async function fetchAllData(filtered = true) {
    const data = {};
    for (const key of Object.keys(urls)) {
        const fetched = await fetchData(key);
        if (filtered) {
            const max = lastConsolidatedDataDay();
            data[key] = fetched.filter(item => new Date(item.DATE) <= max);
        } else {
            data[key] = fetched;
        }
    }
    return data;
}
