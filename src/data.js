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
            sourceName: 'The Lancet',
            rss: 'http://www.thelancet.com/rssfeed/lancet_online.xml',
            icon: 'lancet.jpg',
            language: 'EN',
        },
        {
            sourceName: 'Nature Medicine',
            rss: 'https://www.nature.com/nm.rss',
            icon: 'naturemed.jpg',
            language: 'EN',
        },
        {
            sourceName: 'VRT nws',
            rss: 'https://www.vrt.be/vrtnws/nl.rss.articles.xml',
            icon: 'vrtnws.jpg',
            language: 'NL',
        },
        {
            sourceName: 'RTBF Info',
            rss: 'http://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml',
            icon: 'rtbfinfo.png',
            language: 'FR',
        },
        {
            sourceName: 'VRT (science)',
            rss: 'https://www.vrt.be/vrtnws/en.rss.wetenschap.xml',
            icon: 'vrtnws.jpg',
            language: 'EN',
        },
        {
            sourceName: 'VRT (wetenschap)',
            rss: 'https://www.vrt.be/vrtnws/nl.rss.wetenschap.xml',
            icon: 'vrtnws.jpg',
            language: 'NL',
        },
        {
            sourceName: 'City of Brussels',
            rss: 'https://www.brussels.be/rss.xml',
            icon: 'bxl.png',
            language: 'EN',
        },
    ]
};
export const provinces = {
    'Belgium': 'Belgium',
    'Antwerpen': 'Antwerpen',
    'OostVlaanderen': 'Oost Vlaanderen',
    'VlaamsBrabant': 'Vlaams Brabant',
    'Limburg': 'Limburg',
    'WestVlaanderen': 'West Vlaanderen',
    'Hainaut': 'Hainaut',
    'Liège': 'Liège',
    'Luxembourg': 'Luxembourg',
    'Namur': 'Namur',
    'BrabantWallon': 'Brabant Wallon',
    'Brussels': 'Brussels Capital',
  };
export async function fetchData(url, filtered = true) {
    return url && (await fetch(url)).json();
}
const covidKeywordsRegex = /corona|covid|sars/g;
export async function fetchRssData(url, filtered = true) {
    return parser.parseURL(proxy + url).then(feed => {
        if (filtered) {
            return feed.items.filter(a => {
                return covidKeywordsRegex.test(a.title.toLowerCase()) ||
                    covidKeywordsRegex.test(a.contentSnippet?.toLowerCase() || '') ||
                    covidKeywordsRegex.test(a.content?.toLowerCase() || '');
            });
        } else {
            return feed.items;
        }
    });
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
export function fetchNewsData() {
    const sources = urls.news;
    let dataPromises = [];
    for (const source of sources) {
        dataPromises.push({ ...source, promise: fetchRssData(source.rss)});
    }
    return dataPromises;
}
