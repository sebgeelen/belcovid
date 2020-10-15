    import Parser from 'rss-parser';

const parser = new Parser();
const PROXY = 'https://cors-anywhere.herokuapp.com/';
const URLS = {
    stats: {
        hospitalizations: 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json',
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
export const PROVINCES = {
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
export const AGE_GROUPS = [
    '0-9',
    '10-19',
    '20-29',
    '30-39',
    '40-49',
    '50-59',
    '60-69',
    '70-79',
    '80-89',
    '90+',
    'Age unknown'
];

export function fetchData(key) {
    const url = URLS.stats[key];
    if (url) {
        return fetch(url).then(data => {
            return data.json();
        }).then(jsonData => {
            return [key, jsonData];
        });
    }
}
const covidKeywordsRegex = /corona|covid|sars/g;
export function fetchRssData(url, filtered = true) {
    return parser.parseURL(PROXY + url).then(feed => {
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
export function fetchStatsData() {
    let dataPromises = [];
    for (const key of Object.keys(URLS.stats)) {
        const dataPromise = fetchData(key);
        dataPromises.push(dataPromise);
    }
    return dataPromises;
}
export function fetchNewsData() {
    const sources = URLS.news;
    let dataPromises = [];
    for (const source of sources) {
        dataPromises.push({ ...source, promise: fetchRssData(source.rss)});
    }
    return dataPromises;
}
