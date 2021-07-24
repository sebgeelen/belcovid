import Parser from 'rss-parser';
import { getDateFrom, getIsoDate, normalizeDate } from '../helpers';
import { populationData } from './populationData';

const parser = new Parser();
export const PROXY = 'https://safe-ridge-06878.herokuapp.com/';
const URLS = {
    stats: [
        'cases',
        'mortality',
        'newHospitalizations',
        'newICU',
        'tests',
        'totalHospitalizations',
        'vaccinationPartial',
        'vaccinationFull',
    ],
    news: [
        {
            sourceName: 'The Lancet',
            rss: 'https://www.thelancet.com/rssfeed/lancet_online.xml',
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
            rss: 'https://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml',
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
// eslint-disable-next-line no-unused-vars
const _REFNIS = {
    10000: 'ant',
    20001: 'vbr',
    20002: 'brw',
    30000: 'wvl',
    40000: 'ovl',
    50000: 'hnt',
    60000: 'lge',
    70000: 'lim',
    80000: 'lux',
    90000: 'nam',
};
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
export async function fetchData(url) {
    const data = await fetch(url);
    return await data.json();
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
export function fetchNewsData() {
    const sources = URLS.news;
    let dataPromises = [];
    for (const source of sources) {
        dataPromises.push({ ...source, promise: fetchRssData(source.rss)});
    }
    return dataPromises;
}
export function getWeeklyData(data, weeks = 1) {
    const weeklyData = {};
    let dataIndex = 0;
    for (const date of Object.keys(data)) {
        if (dataIndex >= 6) {
            let comparativeDate = normalizeDate(new Date(date));
            for (let i = 0; i < (weeks * 7); i++) {
                const value = data[getIsoDate(comparativeDate)];
                if (typeof value === 'object') {
                    weeklyData[date] = Object.keys(value).reduce((groups, name) => {
                        groups[name] = (weeklyData[date]?.[name] || 0) + value[name];
                        return groups;
                    }, {});
                } else if (value !== undefined) {
                    weeklyData[date] = (weeklyData[date] || 0) + (value || 0);
                }
                comparativeDate = normalizeDate(getDateFrom(new Date(comparativeDate), -1));
            }
        }
        dataIndex++;
    }
    return weeklyData;
}
// Caveat: works only for cases because assumes their age groups.
export function getIncidenceData(casesData, province = 'be', weeks = 2, reference = 100000) {
    if (!casesData) return;
    const data = {};
    const weeklyCases = getWeeklyData(casesData, weeks);
    const population = populationData.ageGroupsCases[province];
    for (const date of Object.keys(weeklyCases)) {
        if (!data[date]) {
            data[date] = {};
        }
        const casesAtDate = weeklyCases[date];
        for (const ageGroup of Object.keys(casesAtDate)) {
            const cases = casesAtDate[ageGroup];
            let incidence;
            if (ageGroup === 'Age unknown') {
                incidence = 0;
            } else {
                incidence = (reference * cases) / population[ageGroup];
            }
            data[date][ageGroup] = incidence;
        }
    }
    return data;
}

//--------------------------------------------------------------------------
// Keeping this for the record.
//--------------------------------------------------------------------------

function makeAgeMap(ageGroups) {
    const ageMap = {};
    for (const group of ageGroups) {
        const matchA = group.match(/^(\d+)-(\d+)$/);
        const matchB = group.match(/^(\d+)\+$/);
        let start = 0;
        let end = 0;
        if (matchA) {
            start = +matchA[1];
            end = +matchA[2];
        } else if (matchB) {
            start = +matchB[1];
            end = 125; // There definitely isn't anyone older than that...
        } else continue;
        for (let i = start; i <= end; i++) {
            ageMap[i] = group;
        }
    }
    return ageMap;
}
// eslint-disable-next-line no-unused-vars
function _normalizePopulationData(rawPopulationData, ageGroups) {
    const ageMap = makeAgeMap(ageGroups);
    const normalizedData = {be: ageGroups.reduce((groups, group) => {
        groups[group] = 0;
        return groups;
    }, {})};
    normalizedData.be.total = 0;
    for (const province of Object.keys(rawPopulationData)) {
        normalizedData[province] = ageGroups.reduce((groups, group) => {
            groups[group] = 0;
            return groups;
        }, {});
        normalizedData[province].total = 0;
        for (const age of Object.keys(rawPopulationData[province])) {
            const pop = rawPopulationData[province][age];
            const ageGroup = ageMap[age];
            // update age group
            normalizedData[province][ageGroup] += pop;
            // update total
            normalizedData[province].total += pop;
            // update belgium age group
            normalizedData.be[ageGroup] += pop;
            // update belgium total
            normalizedData.be.total += pop;
        }
    }
    return normalizedData;
}
// eslint-disable-next-line no-unused-vars
function daysOfYear() {
    const jan1 = normalizeDate('2020-01-01');
    const dec31 = normalizeDate('2020-12-31');
    const dates = [];
    let date = jan1;
    while (date <= dec31) {
        dates.push(date);
        date = getDateFrom(date, 1);
    }
    return dates;
}
