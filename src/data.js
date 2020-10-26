    import Parser from 'rss-parser';
import { rawPopulationData } from './populationData';

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
    be: 'Belgium',
    ant: 'Antwerpen',
    ovl: 'OostVlaanderen',
    vbr: 'VlaamsBrabant',
    lim: 'Limburg',
    wvl: 'WestVlaanderen',
    hnt: 'Hainaut',
    lge: 'Liège',
    lux: 'Luxembourg',
    nam: 'Namur',
    brw: 'BrabantWallon',
    bxl: 'Brussels',
};
// Reverse of the above object.
const _PROVINCE_KEYS = Object.keys(PROVINCES).reduce((obj, key) => {
    obj[PROVINCES[key]] = key;
    return obj;
}, {});
export const AGE_GROUPS_CASES = [
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
export const AGE_GROUPS_MORTALITY = [
    '0-24',
    '25-44',
    '45-64',
    '65-74',
    '75-84',
    '85+',
    'Age unknown'
];

export function provinceString(provinceKey) {
    return PROVINCES[provinceKey].replace(/([A-Z])/g, ' $1').trim();
}
export function provinceKey(provinceString) {
    return _PROVINCE_KEYS[provinceString];
}
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
// Keeping this for the record.
// eslint-disable-next-line no-unused-vars
function _normalizePopulationData() {
    const points = AGE_GROUPS_CASES.reduce((points, group) => {
        points[group] = 0;
        return points;
    }, {});
    const ageMap = [];
    for (var i = 0; i < 125; i++) {
        if (i >= 0 && i <= 9) ageMap.push('0-9');
        if (i >= 10 && i <= 19) ageMap.push('10-19');
        if (i >= 20 && i <= 29) ageMap.push('20-29');
        if (i >= 30 && i <= 39) ageMap.push('30-39');
        if (i >= 40 && i <= 49) ageMap.push('40-49');
        if (i >= 50 && i <= 59) ageMap.push('50-59');
        if (i >= 60 && i <= 69) ageMap.push('60-69');
        if (i >= 70 && i <= 79) ageMap.push('70-79');
        if (i >= 80 && i <= 89) ageMap.push('80-89');
        if (i >= 90) ageMap.push('90+');
    }
    for (const d of rawPopulationData) {
        const age = +d.AgeGrpStart + +d.AgeGrpSpan - 1;
        points[ageMap[age]] = (points[ageMap[age]] || 0) + (+d.PopTotal * 1000);
    }
    points.total = Object.values(points).reduce((a, b) => a + b, 0);
    return Object.keys(points).reduce((p, group) => {
        p[group] = Math.round(points[group] * 100) / 100;
        return p;
    }, {});
}
