

const URL_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json';
const URL_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json';
const URL_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json';

const urls = {
    hospitalisations: URL_HOSPI,
    tests: URL_TOTAL_TESTS,
    cases: URL_CASES,
};
export async function fetchData(key) {
    const url = urls[key];
    return url && (await fetch(url)).json();
}
export async function fetchAllData() {
    const data = {};
    for (const key of Object.keys(urls)) {
        data[key] = await fetchData(key);
    }
    return data;
}
