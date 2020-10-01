import { lastConsolidatedDataDay } from "./helpers";
import Parser from 'rss-parser';

const parser = new Parser();
const proxy = 'https://cors-anywhere.herokuapp.com/';
const urls = {
    stats: {
        hospitalisations: 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json',
        tests: 'https://epistat.sciensano.be/Data/COVID19BE_tests.json',
        cases: 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json',
        mortality: 'https://epistat.sciensano.be/Data/COVID19BE_MORT.json',
    },
    news: {
        'vrt-science-en': 'https://www.vrt.be/vrtnws/en.rss.wetenschap.xml',
        'vrt-wetenschap-nl': 'https://www.vrt.be/vrtnws/nl.rss.wetenschap.xml',
        'rtbf-info': 'http://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml'
    }
};
export async function fetchData(url, filtered = true) {
    return url && (await fetch(url)).json();
}
export async function fetchRssData(url, filtered = true) {
    const feed = await parser.parseURL(proxy + url);
    const coronaItems = feed.items.filter(a => {
        return a.title.toLowerCase().includes('corona') || a.description?.toLowerCase().includes('corona');
    });
    return coronaItems;
}
export async function fetchStatsData(filtered = true) {
    const data = {};
    for (const key of Object.keys(urls.stats)) {
        const fetched = await fetchData(urls.stats[key]);
        if (filtered) {
            const max = lastConsolidatedDataDay();
            data[key] = fetched.filter(item => new Date(item.DATE) <= max);
        } else {
            data[key] = fetched;
        }
    }
    return data;
}
export async function fetchNewsData() {
    let data = [];
    for (const source of Object.keys(urls.news)) {
        const newData = await fetchRssData(urls.news[source]);
        for (const item of newData) {
            item.source = source;
        }
        data = [...data, ...newData];
    }
    return data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}
