import React from 'react';
import ChartByAge from './ChartByAge';
import AveragedData from './AveragedData';
import Testing from './Testing';
import RateOfChange from './RateOfChange';
import { Container, Divider, FormControl, FormControlLabel, FormLabel, Grid, Link, Radio, RadioGroup, Slider, Tooltip } from '@material-ui/core';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { AGE_GROUPS_CASES, AGE_GROUPS_MORTALITY, provinceString } from '../../data';
import { casesAnnotations as testingAnnotations, getWeeklyData, lastConsolidatedDataDay } from '../../helpers';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import { populationData } from '../../populationData';

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
        testing: {
            title: 'Test positivity ratio',
            annotations: testingAnnotations,
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
};

export default class Charts extends React.Component {
    state = {
        mainVariable: window.location.pathname.split('/')[2] || 'cases',
        chartType: window.location.pathname.split('/')[3] || 'average',
        incidenceDays: +(window.location.pathname.split('/')[4] || 14),
        incidenceDenominator: +(window.location.pathname.split('/')[4] || 100000),
    }
    classes = this.props.classes;

    render() {
        return (
            <React.Fragment>
                <Title>Charts for {provinceString(this.props.province)}</Title>
                <FormControl component="fieldset" className={this.classes.formControl} style={{width: "100%"}}>
                    <Grid container spacing={4} justify="center">
                        <Grid item xs>
                            <FormLabel component="legend">Main variable</FormLabel>
                            <RadioGroup
                                value={this.state.mainVariable}
                                onChange={ (ev) => this.setState({ mainVariable: ev.target.value }) }
                            >
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/cases/${this.state.chartType}${window.location.search}`}
                                        />
                                    }
                                    value="cases"
                                    label="Cases" />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/incidence/${this.state.chartType}${window.location.search}`}
                                        />
                                    }
                                    value="incidence"
                                    label="Incidence"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/hospitalizations/${this.state.chartType}${window.location.search}`}
                                        />
                                    }
                                    value="hospitalizations"
                                    label="Hospitalizations"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/icu/${this.state.chartType}${window.location.search}`}
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
                                                to={`/charts/mortality/${this.state.chartType}${window.location.search}`}
                                            />
                                        }
                                        value="mortality"
                                        label="Mortality"
                                        disabled={this.props.province !== 'be'}
                                    />
                                </Tooltip>
                            </RadioGroup>
                        </Grid>
                        <Grid item xs>
                            <FormLabel component="legend">Chart type</FormLabel>
                            <RadioGroup
                                value={this.state.chartType}
                                onChange={ (ev) => this.setState({ chartType: ev.target.value }) }
                            >
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/${this.state.mainVariable}/average${window.location.search}`}
                                        />
                                    }
                                    value="average"
                                    label="Rolling average"
                                />
                                <Tooltip title="Testing positivity should only be viewed in relationship with case numbers.">
                                    <FormControlLabel
                                        control={
                                            <Radio
                                                component={RouterLink}
                                                to={`/charts/${this.state.mainVariable}/testing${window.location.search}`}
                                            />
                                        }
                                        value="testing"
                                        label="Testing ratio"
                                        disabled={this.state.mainVariable !== 'cases'}
                                    />
                                </Tooltip>
                                <FormControlLabel
                                    control={
                                        <Radio
                                            component={RouterLink}
                                            to={`/charts/${this.state.mainVariable}/change${window.location.search}`}
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
                        <Route path="/charts/:mainVariable/:chartType/:incidenceDays/:incidenceDenominator">
                            {this.getChart.bind(this)}
                        </Route>
                        <Route path="/charts">
                            {this.getChart.bind(this)}
                        </Route>
                    </Switch>
                </section>
            </React.Fragment>
        );
    }
    getChart({history, location, match}) {
        const params = match.params;
        const mainVariable = params.mainVariable || this.state.mainVariable;
        const chartType = params.chartType || this.state.chartType;
        const variableInfo = dataInfo[mainVariable];
        if (!variableInfo) return;
        const chartInfo = variableInfo[chartType];
        if (!chartInfo) return;
        let data;
        switch (mainVariable) {
            case 'hospitalizations':
                data = this.props.totalHospitalizations;
                break;
            case 'icu':
                data = this.props.totalICU;
                break;
            case 'incidence':
                data = this._getIncidenceData(this.state.incidenceDays, this.state.incidenceDenominator);
                break;
            default:
                data = this.props[mainVariable];
        }
        if (!data) {
            return <Skeleton variant="rect" height={200} />;
        }
        let chart;
        switch (chartType) {
            case 'average': {
                if (chartInfo.ageGroups) {
                    let labelStrings = chartInfo.labelStrings;
                    if (mainVariable === 'incidence') {
                        const denominator = this.state.incidenceDenominator;
                        labelStrings = {
                            y: `cases / ${
                                denominator === 100 ?
                                    100 + 'inhabitants' :
                                    (denominator / 1000) + 'k'
                                }`,
                        };
                    }
                    chart = (
                        <ChartByAge
                            classes={this.classes}
                            data={data}
                            annotations={chartInfo.annotations}
                            chartName={chartInfo.title}
                            asImage={true}
                            ageGroups={chartInfo.ageGroups}
                            stacked={chartInfo.stacked}
                            ticksCallbacks={chartInfo.ticksCallbacks}
                            labelStrings={labelStrings}
                            max={mainVariable !== 'incidence' && lastConsolidatedDataDay()}
                        />
                    );
                } else {
                    chart = (
                        <AveragedData
                            classes={this.classes}
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
            case 'testing': {
                const formattedDataName = mainVariable.charAt(0).toUpperCase() + mainVariable.slice(1);
                chart = (
                    <Testing
                        classes={this.classes}
                        testData={this.props.tests}
                        comparativeData={data}
                        comparativeDataName={formattedDataName}
                        chartName={chartInfo.title}
                        annotations={chartInfo.annotations}
                        asImage={true}
                        max={lastConsolidatedDataDay()}
                    />
                );
                break;
            }
            case 'change': {
                chart = (
                    <RateOfChange
                        classes={this.classes}
                        data={data}
                        chartName={chartInfo.title}
                        annotations={chartInfo.annotations}
                        asImage={true}
                        max={mainVariable !== 'incidence' && lastConsolidatedDataDay()}
                    />
                );
                break;
            }
            default: break;
        }
        let title = chartInfo.title;
        if (mainVariable === 'incidence' && chartType === 'average') {
            title += ` (${this.state.incidenceDays} days, `;
            if (this.state.incidenceDenominator === 100) {
                title += 'in %)';
            } else {
                title += `per ${this.state.incidenceDenominator / 1000}k inhabitants)`;
            }
        }
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="icu">{title}</Title>
                {
                    variableInfo.description &&
                    <p><small>{variableInfo.description}</small></p>
                }
                {
                    chartInfo.description &&
                    <p><small>{chartInfo.description}</small></p>
                }

                <div className={this.classes.chartSection}>
                    { chart }
                </div>

                {
                    this.state.mainVariable === 'incidence' &&
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
                            onChange={(ev, value) => this.setState({ incidenceDays: value })}
                        />
                        {
                            this.state.chartType === 'average' &&
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
                                onChange={(ev, value) => this.setState({ incidenceDenominator: value })}
                            />
                        }
                    </Container>
                }
            </React.Fragment>
        );
    }
    // TODO: make weeks and reference parametrable by chart or user.
    // Caveat: works only for cases because assumes their age groups.
    _getIncidenceData(weeks = 2, reference = 100000) {
        if (!this.props.cases) return;
        const data = {};
        const weeklyCases = getWeeklyData(this.props.cases, weeks);
        const population = populationData.ageGroupsCases[this.props.province];
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
}
