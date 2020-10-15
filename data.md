# Data Structures

The general structure for the normalized data from Sciensano:

```ts
stats = [
    cases: {
        [date]: {
            Belgium: Figures,
            [Provinces]: Figures,
        },
    },
    hospitalizations: {
        [date]: {
            Belgium: Figures,
            [Provinces]: Figures,
        },
    },
    icu: {
        [date]: {
            Belgium: Figures,
            [Provinces]: Figures,
        },
    },
    mortality: {
        [date]: {
            Belgium: Figures,
            [Provinces]: Figures,
        },
    },
    tests: {
        [date]: {
            Belgium: Figures,
            [Provinces]: Figures,
        },
    },
]
```

... where:

```ts
Provinces = {
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
]
```
