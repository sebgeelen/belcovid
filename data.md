# Data Structures

The general structure for the normalized data from Sciensano:

```ts
stats = [
    cases: {
        [date]: {
            be: Figures,
            [Provinces]: Figures,
        },
    },
    hospitalizations: {
        [date]: {
            be: Figures,
            [Provinces]: Figures,
        },
    },
    icu: {
        [date]: {
            be: Figures,
            [Provinces]: Figures,
        },
    },
    mortality: {
        [date]: {
            be: Figures,
            [Provinces]: Figures,
        },
    },
    tests: {
        [date]: {
            be: Figures,
            [Provinces]: Figures,
        },
    },
]
```

... where:

```ts
Provinces = {
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

```ts
Figures = {
    total: number,
    [AgeGroups]: number,
} | number
```

```ts
AgeGroups = [
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
] | [
    '0-24',
    '25-44',
    '45-64',
    '65-74',
    '75-84',
    '85+',
    'Age unknown'
]
```
The former is for cases, the latter for mortality, due to the way Sciensano reports its data.
