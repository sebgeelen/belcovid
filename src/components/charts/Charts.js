import React, { useEffect, useState } from 'react';
import ChartByAge from './ChartByAge';
import AveragedData from './AveragedData';
import RateOfChange from './RateOfChange';
import { Container, Divider, FormControl, FormControlLabel, FormLabel, Grid, Link, Radio, RadioGroup, Slider, Tooltip } from '@material-ui/core';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { AGE_GROUPS_CASES, AGE_GROUPS_MORTALITY, getIncidenceData, provinceString } from '../../data/data';
import { testingAnnotations, lastConsolidatedDataDay } from '../../helpers';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';

export const dataInfo = {
    cases: {
        average: {
            title: 'New cases, by age group (7-day rolling average)',
            annotations: testingAnnotations,
            ageGroups: AGE_GROUPS_CASES,
            stacked: true,
            labelStrings: {
                y: 'new cases',
            },
        },
        change: {
            title: 'Week by week change of new cases',
            description: (
                <React.Fragment>
                    How fast is the number of cases rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of new cases between the last 7 days
                        and the 7 days before that).</i>
                </React.Fragment>
            ),
            annotations: testingAnnotations,
        },
    },
    incidence: {
        description: (
            <React.Fragment>Population data
                from <Link href={'https://statbel.fgov.be/en/open-data/' +
                    'population-place-residence-nationality-marital-status-' +
                    'age-and-sex-10'} target="_blank">
                    StatBel, 2019
                </Link>.
            </React.Fragment>
        ),
        average: {
            title: 'Incidence, by age group',
            annotations: testingAnnotations,
            ageGroups: (() => {
                const groups = [...AGE_GROUPS_CASES];
                groups.pop();
                groups.push('total');
                return groups;
            })(),
            stacked: false,
            labelStrings: {
                y: 'cases / 100k',
            },
        },
        change: {
            title: 'Week by week change of incidence',
            description: (
                <React.Fragment>
                    How fast is the incidence rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of new cases between the last 7 days
                        and the 7 days before that).</i>
                </React.Fragment>
            ),
            annotations: testingAnnotations,
        },
    },
    hospitalizations: {
        description: 'This concerns the number of patients that are hospitalized on a given day, not only the new admissions.',
        average: {
            title: 'Patients at the hospital',
            labelStrings: {
                y: 'total hospital patients',
            },
        },
        change: {
            title: 'Week by week change of hospitalized patients',
            description: (
                <React.Fragment>
                    How fast is the number of patients at the hospital rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of patients at the hospital between the last
                        7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    icu: {
        description: 'This concerns the number of patients that are in intensive care on a given day, not only the new admissions.',
        average: {
            title: 'Patients in intensive care',
            labelStrings: {
                y: 'total ICU patients',
            },
        },
        change: {
            title: 'Week by week change of patients in intensive care',
            description: (
                <React.Fragment>
                    How fast is the number of patients in ICU rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of patients in intensive care between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    mortality: {
        average: {
            title: 'Mortality, by age group (7-day rolling average)',
            ageGroups: AGE_GROUPS_MORTALITY,
            stacked: true,
            labelStrings: {
                y: 'new deaths',
            },
        },
        change: {
            title: 'Week by week change of mortality',
            description: (
                <React.Fragment>
                    How fast is the mortality rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of mortality between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    tests: {
        average: {
            title: 'Tests administered (7-day rolling average)',
            labelStrings: {
                y: 'new tests',
            },
        },
        change: {
            title: 'Week by week change of testing',
            description: (
                <React.Fragment>
                    How fast is the testing rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of tests between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
};
const compareOrder = ['tests', 'cases', 'hospitalizations', 'icu', 'mortality'];

export default function Charts({
    cases,
    classes,
    mortality,
    newHospitalizations,
    province,
    tests,
    totalHospitalizations,
    totalICU,
}) {
    const urlParams = new URLSearchParams(window.location.search);
    const [variable1, setVariable1] = useState(urlParams.get('var1') || 'cases');
    const [variable2, setVariable2] = useState(urlParams.get('var2') || '');
    const [chartType, setChartType] = useState(urlParams.get('chartType') || 'average');
    const [incidenceDays, setIncidenceDays] = useState(+urlParams.get('incDays') || 14);
    const [incidenceDenominator, setIncidenceDenominator] = useState(+urlParams.get('incDen') || 100000);

    useEffect(() => {
        if (['incidence', 'icu', variable2].includes(variable1)) {
            setVariable2('');
        }
        urlParams.set('var1', variable1);
        variable2 ? urlParams.set('var2', variable2) : urlParams.delete('var2');
        chartType ? urlParams.set('chartType', chartType) : urlParams.delete('chartType');
        if ('?' + urlParams.toString() !== window.location.search) {
            const newUrl = `${window.location.pathname}${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    }, [variable1, variable2, chartType, urlParams]);

    const getData = variableName => {
        switch (variableName) {
            case 'cases': {
                return cases;
            }
            case 'hospitalizations': {
                return variable2 ? newHospitalizations : totalHospitalizations;
            }
            case 'icu':
                return totalICU;
            case 'incidence':
                return getIncidenceData(
                    cases,
                    province,
                    incidenceDays,
                    incidenceDenominator,
                );
            case 'mortality':
                return mortality;
            case 'tests':
                return tests;
            default:
                return null;
        }
    }
    const getChart = () => {
        const variableInfo = dataInfo[variable1];
        if (!variableInfo) return;
        const chartInfo = variableInfo[chartType];
        if (!chartInfo) return;
        const data = getData(variable1);
        if (!data) {
            return <Skeleton variant="rect" height={200} />;
        }
        let chart;
        let title = chartInfo.title;
        if (variable2) {
            const data2 = getData(variable2);
            const comparedData = {};
            let currentTotal1 = 0;
            let currentTotal2 = 0;
            const mustReverse = compareOrder.indexOf(variable1) > compareOrder.indexOf(variable2);
            for (const date of Object.keys(data)) {
                currentTotal1 += typeof data[date] === 'object'
                    ? data[date].total
                    : data[date];
                const today2 = data2[date];
                currentTotal2 += today2
                    ? (
                        typeof today2 === 'object'
                            ? today2.total
                            : today2
                        )
                    : 0;
                comparedData[date] = 100 * (mustReverse
                    ? currentTotal1 / currentTotal2
                    : currentTotal2 / currentTotal1);
            }
            title = `Cumulative ${mustReverse ? variable1 : variable2} / cumulative ${mustReverse
                ? variable2
                : variable1}`;
            const labelStrings = {
                y: `total ${mustReverse ? variable1 : variable2} / total ${mustReverse
                    ? variable2
                    : variable1} (in %)`,
            };
            switch (chartType) {
                case 'average':
                    chart = (
                        <AveragedData
                            classes={classes}
                            data={comparedData}
                            chartName={title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            labelStrings={labelStrings}
                            noAverage={true}
                            max={lastConsolidatedDataDay()}
                        />
                    );
                    break;
                case 'change':
                    chart = (
                        <RateOfChange
                            classes={classes}
                            data={comparedData}
                            chartName={title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            labelStrings={labelStrings}
                            max={lastConsolidatedDataDay()}
                        />
                    );
                    break;
                default: break;
            }
        } else {
            switch (chartType) {
                case 'average': {
                    if (chartInfo.ageGroups) {
                        let labelStrings = chartInfo.labelStrings;
                        if (variable1 === 'incidence') {
                            labelStrings = {
                                y: `cases / ${
                                    incidenceDenominator === 100 ?
                                        100 + 'inhabitants' :
                                        (incidenceDenominator / 1000) + 'k'
                                    }`,
                            };
                        }
                        chart = (
                            <ChartByAge
                                classes={classes}
                                data={data}
                                annotations={chartInfo.annotations}
                                chartName={chartInfo.title}
                                asImage={true}
                                ageGroups={chartInfo.ageGroups}
                                stacked={chartInfo.stacked}
                                ticksCallbacks={chartInfo.ticksCallbacks}
                                labelStrings={labelStrings}
                                max={variable1 !== 'incidence' && lastConsolidatedDataDay()}
                            />
                        );
                    } else {
                        chart = (
                            <AveragedData
                                classes={classes}
                                data={data}
                                chartName={chartInfo.title}
                                annotations={chartInfo.annotations}
                                asImage={true}
                                labelStrings={chartInfo.labelStrings}
                                max={lastConsolidatedDataDay()}
                            />
                        );
                    }
                    break;
                }
                case 'change': {
                    chart = (
                        <RateOfChange
                            classes={classes}
                            data={data}
                            chartName={chartInfo.title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            max={variable1 !== 'incidence' && lastConsolidatedDataDay()}
                        />
                    );
                    break;
                }
                default: break;
            }
        }
        if (!variable2 && variable1 === 'incidence' && chartType === 'average') {
            title += ` (${incidenceDays} days, `;
            if (incidenceDenominator === 100) {
                title += 'in %)';
            } else {
                title += `per ${incidenceDenominator / 1000}k inhabitants)`;
            }
        }
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="icu">{title}</Title>
                {
                    !variable2 && variableInfo.description &&
                    <p><small>{variableInfo.description}</small></p>
                }
                {
                    !variable2 && chartInfo.description &&
                    <p><small>{chartInfo.description}</small></p>
                }

                <div className={classes.chartSection}>
                    { chart }
                </div>

                {
                    variable1 === 'incidence' &&
                    <Container style={{ marginTop: 15, maxWidth: 500 }}>
                        <Slider
                            defaultValue={14}
                            getAriaValueText={value => `${value} days`}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            step={7}
                            marks={[
                                {
                                    value: 7,
                                    label: '7 days',
                                },
                                {
                                    value: 14,
                                    label: '14 days',
                                },
                            ]}
                            min={7}
                            max={14}
                            onChange={(ev, value) => setIncidenceDays(value)}
                        />
                        {
                            chartType === 'average' &&
                            <Slider
                                defaultValue={100000}
                                getAriaValueText={value => {
                                    if (value === 100) return '%';
                                    return `/${value / 1000}k`;
                                }}
                                valueLabelFormat={value => {
                                    if (value === 100) return '%';
                                    return `/${value / 1000}k`;
                                }}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                step={null}
                                marks={[
                                    {
                                        value: 100,
                                        label: '%',
                                    },
                                    {
                                        value: 10000,
                                        label: '/10k',
                                    },
                                    {
                                        value: 50000,
                                        label: '/50k',
                                    },
                                    {
                                        value: 100000,
                                        label: '/100k',
                                    },
                                ]}
                                min={100}
                                max={100000}
                                onChange={(ev, value) => setIncidenceDenominator(value)}
                            />
                        }
                    </Container>
                }
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            <Title>Charts for {provinceString(province)}</Title>
            <FormControl component="fieldset" className={classes.formControl} style={{width: "100%"}}>
                <Grid container spacing={4} justify="center">
                    <Grid item xs>
                        <FormLabel component="legend">Variable</FormLabel>
                        <RadioGroup
                            value={variable1}
                            onChange={ev => setVariable1(ev.target.value)}
                        >
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="cases"
                                label="Cases" />
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="incidence"
                                label="Incidence"
                            />
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="hospitalizations"
                                label="Hospitalizations"
                            />
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="icu"
                                label="Intensive Care Units"
                            />
                            <Tooltip title="Mortality data cannot be filtered per province.">
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    value="mortality"
                                    label="Mortality"
                                    disabled={province !== 'be'}
                                />
                            </Tooltip>
                            <Tooltip title="Testing data cannot be filtered per province.">
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    value="tests"
                                    label="Tests"
                                    disabled={province !== 'be'}
                                />
                            </Tooltip>
                        </RadioGroup>
                    </Grid>
                    {
                        !['incidence', 'icu'].includes(variable1) &&
                        <Grid item xs>
                            <FormLabel component="legend">Compare with</FormLabel>
                            <RadioGroup
                                value={variable2}
                                onChange={(ev) => setVariable2(ev.target.value)}
                            >
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    value={''}
                                    label="None" />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    disabled={['cases', 'incidence', 'icu'].includes(variable1)}
                                    value="cases"
                                    label="Cases" />
                                <FormControlLabel
                                    control={
                                    <Radio
                                        component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    disabled={['incidence', 'hospitalizations', 'icu'].includes(variable1)}
                                    value="hospitalizations"
                                    label="Hospitalizations"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                        />
                                    }
                                    disabled={['incidence', 'icu'].includes(variable1)}
                                    value="icu"
                                    label="Intensive Care Units"
                                />
                                <Tooltip title="Mortality data cannot be filtered per province.">
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                component={RouterLink}
                                                to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                            />
                                        }
                                        disabled={province !== 'be' || ['incidence', 'mortality', 'icu'].includes(variable1)}
                                        value="mortality"
                                        label="Mortality"
                                    />
                                </Tooltip>
                                <Tooltip title="Testing data cannot be filtered per province.">
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                component={RouterLink}
                                                to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                            />
                                        }
                                        disabled={province !== 'be' || ['tests', 'incidence', 'icu'].includes(variable1)}
                                        value="tests"
                                        label="Tests"
                                    />
                                </Tooltip>
                            </RadioGroup>
                        </Grid>
                    }
                    <Grid item xs>
                        <FormLabel component="legend">Chart type</FormLabel>
                        <RadioGroup
                            value={chartType}
                            onChange={ (ev) => setChartType(ev.target.value) }
                        >
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="average"
                                label={variable2 ? 'Ratio' : 'Rolling average'}
                            />
                            <FormControlLabel
                                control={
                                    <Radio
                                        component={RouterLink}
                                        to={`/charts${window.location.hash.replace(/\?.*$/, '')}?${urlParams.toString()}`}
                                    />
                                }
                                value="change"
                                label="Rate of change"
                            />
                        </RadioGroup>
                    </Grid>
                </Grid>
            </FormControl>
            <section id="chart">
                <Switch>
                    <Route path="/charts">
                        {getChart}
                    </Route>
                </Switch>
            </section>
        </React.Fragment>
    );
}
