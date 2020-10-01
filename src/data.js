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
    news: [
        {
            source: 'VRT (science)',
            rss: 'https://www.vrt.be/vrtnws/en.rss.wetenschap.xml',
            icon: 'vrtnws.jpg',
            language: 'EN',
        },
        {
            source: 'VRT (wetenschap)',
            rss: 'https://www.vrt.be/vrtnws/nl.rss.wetenschap.xml',
            icon: 'vrtnws.jpg',
            language: 'NL',
        },
        {
            source: 'VRT nws',
            rss: 'https://www.vrt.be/vrtnws/nl.rss.articles.xml',
            icon: 'vrtnws.jpg',
            language: 'NL',
        },
        {
            source: 'RTBF Info',
            rss: 'http://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml',
            icon: 'rtbfinfo.png',
            language: 'FR',
        },
        {
            source: 'City of Brussels',
            rss: 'https://www.brussels.be/rss.xml',
            icon: 'bxl.png',
            language: 'EN',
        }
    ]
};
export async function fetchData(url, filtered = true) {
    return url && (await fetch(url)).json();
}
const covidKeywordsRegex = /corona|covid|sars/g;
export async function fetchRssData(url, filtered = true) {
    const feed = await parser.parseURL(proxy + url);
    if (filtered) {
        return feed.items.filter(a => {
            return covidKeywordsRegex.test(a.title.toLowerCase()) ||
                covidKeywordsRegex.test(a.contentSnippet?.toLowerCase() || '') ||
                covidKeywordsRegex.test(a.content?.toLowerCase() || '');
        });
    } else {
        return feed.items;
    }
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
    const sources = urls.news;
    let data = [];
    for (const source of sources) {
        const newData = await fetchRssData(source.rss);
        data = [...data, ...newData.map(item => {
            return { ...item, ...source };
        })];
    }
    return data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}
