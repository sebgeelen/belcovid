# BelCovid

A React-powered Covid-19 tracker for Belgium.

## Acknowledgments
This is something I started for my family and I in order to get a better grasp
on some metrics, and help us follow the situation so we could make informed
decisions for our safety and that of our cocitizens. At the same time, it was an
opportunity to get acquainted with React. With time it changed and grew and it
now seems appropriate to share the code so hopefully it can benefit from the
expertise of the community. I am in no way an epidemiologist so if there's
anything wrong with my approaches do not hesitate to file an issue.

## Installation
Clone the repository then in its folder:
```bash
npm install
npm start
```

## Contributions
Feel free to file issues and propose Pull Requests. I do this in my spare time
so I can't guarantee much reactivity but I will do what I can. The more precise
the bug reports the better.

## Features

### Dashboard
- News aggregator for various news sources in French, Dutch and English,
    including major scientific journals
- Table of data for a quick look at the latest developments
- Naive predictions (based on compound interest):
    - Day of next peak (when the value reaches the same level as the highest
        recorded)
    - Day of saturation (for hospitalizations and intensive care admissions,
        when the value reaches capacity) - Estimated number of hospital beds from
        [healthybelgium.be](https://www.healthybelgium.be/en/key-data-in-healthcare/general-hospitals/organisation-of-the-hospital-landscape/categorisation-of-hospital-activities/evolution-of-the-number-of-accredited-hospital-beds)
        (52565) and historical hospitalization data from
        [KCE](https://kce.fgov.be/sites/default/files/atoms/files/T%C3%A9l%C3%A9charger%20la%20synth%C3%A8se%20en%20fran%C3%A7ais%20%2884%20p.%29.pdf)
        were used to estimate the number of beds available per day (20769),
        [number of ICU beds from VRT: 2650](https://www.vrt.be/vrtnws/en/2020/03/22/health-minister-says-that-an-additional-759-intensive-care-beds)
- Table of data can be filtered by province (where the data exists)

### Charts
- Made with [react-chartjs-2](https://github.com/reactchartjs/react-chartjs-2)
- Using Covid-19 data from Sciensano
- Incidence charts using population data from StatBel and Covid-19 data from Sciensano
- Rate of change computations
- Comparative charts
- Simple regression trend lines using
    [js-polynomial-regression](https://www.npmjs.com/package/js-polynomial-regression)
- Everything can be filtered by province (where the data exists)

## Data Structures

All data drom Sciensano is normalized in the following way (drawing inspiration
from typescript syntax for ease of presentation of interfaces).

With:
```js
// Two distributions of age groups exist, due to the way Sciensano reports its data.
CaseAgeGroups = [
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
MortalityAgeGroups = [
    '0-24',
    '25-44',
    '45-64',
    '65-74',
    '75-84',
    '85+',
    'Age unknown'
];
interface AgeSortedFigures<('cases' | 'mortality') as T> {
    total: number,
    [T === 'cases' ? CaseAgeGroups : MortalityAgeGroups]: number, // for each age group
}
interface Provinces {
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
}
```
The data itself looks like this:
```ts
interface cases {
    [province: keyof Provinces]: { // for each province
        [date: string]: AgeSortedFigures<'cases'>, // for each date
    },
}
// The number of people occupying a hospital bed.
interface totalHospitalizations {
    [province: keyof Provinces]: { // for each province
        [date: string]: number, // for each date
    },
}
// The number of new hospital admissions.
interface newHospitalizations {
    [province: keyof Provinces]: { // for each province
        [date: string]: number, // for each date
    },
}
// The number of people occupying an ICU bed.
interface totalICU {
    [province: keyof Provinces]: { // for each province
        [date: string]: number, // for each date
    },
}
interface mortality {
    be: {
        [date: string]: AgeSortedFigures<'mortality'>, // for each date
    },
    [province: keyof Provinces]: {}, // for each province but 'be' (data unavailable)
}
interface tests {
    [province: keyof Provinces]: { // for each province
        [date: string]: number, // for each date
    },
}
```
