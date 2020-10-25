import React from 'react';
import ChartByAge from './ChartByAge';
import AveragedData from './AveragedData';
import Testing from './Testing';
import RateOfChange from './RateOfChange';
import { Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Tooltip } from '@material-ui/core';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { AGE_GROUPS_CASES, AGE_GROUPS_MORTALITY, provinceString } from '../../data';
import { casesAnnotations as testingAnnotations } from '../../helpers';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';

export const dataInfo = {
    cases: {
        average: {
            title: 'New cases, by age group (7-day rolling average)',
            annotations: testingAnnotations,
            ageGroups: AGE_GROUPS_CASES,
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
    hospitalizations: {
        description: 'This concerns the number of patients that are hospitalized on a given day, not only the new admissions.',
        average: {
            title: 'Patients at the hospital',
        },
        testing: {
            title: 'Percentage of patients at the hospital per test',
            annotations: testingAnnotations,
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
        },
        testing: {
            title: 'Percentage of patients in intensive care per test',
            annotations: testingAnnotations,
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
        },
        testing: {
            title: 'Percentage of mortality per test',
            annotations: testingAnnotations,
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
    }
    classes = this.props.classes;

    render() {
        return (
            <React.Fragment>
                <Title>Charts for {provinceString(this.props.province)}</Title>
                <FormControl component="fieldset" className={this.classes.formControl} style={{width: "100%"}}>
                    <Grid container spacing={6} justify="center">
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
                                    label="7-day rolling average"
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
                        <Route path="/charts/:mainVariable/:chartType">
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
        let dataName = mainVariable;
        if (dataName === 'hospitalizations') dataName = 'totalHospitalizations';
        if (dataName === 'icu') dataName = 'totalICU';
        const data = this.props[dataName];
        if (!data) {
            return <Skeleton variant="rect" height={200} />;
        }
        let chart;
        switch (chartType) {
            case 'average': {
                if (chartInfo.ageGroups) {
                    chart = (
                        <ChartByAge
                            classes={this.classes}
                            data={data}
                            annotations={chartInfo.annotations}
                            chartName={chartInfo.title}
                            asImage={true}
                            ageGroups={chartInfo.ageGroups}
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
                    />
                );
                break;
            }
            default: break;
        }
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="icu">{chartInfo.title}</Title>
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
            </React.Fragment>
        );
    }
}
