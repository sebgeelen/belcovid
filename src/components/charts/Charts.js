import React from 'react';
import CasesByAge from './CasesByAge';
import AveragedData from './AveragedData';
import Testing from './Testing';
import RateOfChange from './RateOfChange';
import { Container, Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Tooltip } from '@material-ui/core';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { PROVINCES } from '../../data';
import { casesAnnotations } from '../../helpers';

export default class Charts extends React.Component {
    state = {
        mainVariable: undefined,
    }
    classes = this.props.classes;

    render() {
        return (
            <main className={this.classes.content}>
                <div className={this.classes.appBarSpacer} />
                <Container maxWidth="lg" className={this.classes.container}>
                    <Title>Charts for {PROVINCES[this.props.province]}</Title>
                    <FormControl component="fieldset" className={this.classes.formControl} style={{width: "100%"}}>
                        <Grid container spacing={6} justify="center">
                            <Grid item xs>
                                <FormLabel component="legend">Main variable</FormLabel>
                                <RadioGroup onChange={ (ev) => this.setState({ mainVariable: ev.target.value }) }>
                                    <FormControlLabel control={<Radio />} value="cases" label="Cases" />
                                    <FormControlLabel control={<Radio />} value="hospitalizations" label="Hospitalizations" />
                                    <FormControlLabel control={<Radio />} value="icu" label="Intensive Care Units" />
                                    <Tooltip title="Mortality data cannot be filtered per province.">
                                        <FormControlLabel
                                            control={<Radio />} value="mortality" label="Mortality"
                                            disabled={this.props.province !== 'Belgium'}
                                        />
                                    </Tooltip>
                                </RadioGroup>
                            </Grid>
                        </Grid>
                    </FormControl>
                    { this.state.mainVariable === 'cases' && this.Cases() }
                    { this.state.mainVariable === 'hospitalizations' && this.Hospitalizations() }
                    { this.state.mainVariable === 'icu' && this.Icu() }
                    { this.state.mainVariable === 'mortality' && this.Mortality() }
                </Container>
            </main>
        );
    }
    Cases() {
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title>Cases</Title>

                {this.props.cases ?
                    <section id="cases-age" className={this.classes.chartSection}>
                        <h3>New cases, by age group (7-day rolling average)</h3>
                        <CasesByAge
                            classes={this.classes}
                            data={this.props.cases}
                            chartName="New cases, by age group (7-day rolling average)"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.cases && this.props.tests ?
                    <section id="positive-test-rate" className={this.classes.chartSection}>
                        <h3>Percentage of positive tests</h3>
                        <Testing
                            classes={this.classes}
                            testData={this.props.tests}
                            comparativeData={this.props.cases}
                            comparativeDataName="Cases"
                            chartName="Percentage of positive tests"
                            annotations={casesAnnotations}
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.cases ?
                    <section id="rate-of-change-cases" className={this.classes.chartSection}>
                        <h3>Week by week change of new cases</h3>
                        <p><small>How fast is the number of cases rising/falling (in %) ?<br/>
                            <i>(The percentage change in number of new cases between the last 7 days
                                and the 7 days before that).</i></small></p>
                        <RateOfChange
                            classes={this.classes}
                            data={this.props.cases}
                            chartName="Week by week change of new cases"
                            annotations={casesAnnotations}
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }
            </React.Fragment>
        );
    }
    Hospitalizations() {
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="hospi">Hospitalizations</Title>
                <p><small>We count here in number of patients that are hospitalized <i>simultaneously</i> (not just new admissions).</small></p>

                {this.props.totalHospitalizations ?
                    <section id="hospital-patients" className={this.classes.chartSection}>
                        <h3>Patients at the hospital</h3>
                        <AveragedData
                            classes={this.classes}
                            data={this.props.totalHospitalizations}
                            chartName="Number of patients at the hospital"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.totalHospitalizations && this.props.tests ?
                    <section id="hospi-test-rate" className={this.classes.chartSection}>
                        <h3>Percentage of simultaneous hospital patients for the amount of tests</h3>
                        <Testing
                            classes={this.classes}
                            testData={this.props.tests}
                            comparativeData={this.props.totalHospitalizations}
                            comparativeDataName="Hospital patients"
                            chartName="Percentage of simultaneous hospital patients for the amount of tests"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.totalHospitalizations ?
                    <section id="rate-of-change-hospi" className={this.classes.chartSection}>
                        <h3>Week by week change of hospitalized patients</h3>
                        <p><small>How fast is the number of patients at the hospital rising/falling (in %) ?</small></p>
                        <RateOfChange
                            classes={this.classes}
                            data={this.props.totalHospitalizations}
                            chartName="Week by week change of hospitalized patients"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }
            </React.Fragment>
        );
    }
    Icu() {
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="icu">Intensive Care Units</Title>
                <p><small>We count here in number of patients that are <i>simultaneously</i> in ICU (not just new admissions).</small></p>

                {this.props.totalICU ?
                    <section id="icu-patients" className={this.classes.chartSection}>
                        <h3>Patients in intensive care</h3>
                        <AveragedData
                            classes={this.classes}
                            data={this.props.totalICU}
                            chartName="Number of patients in ICU"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.totalICU && this.props.tests ?
                    <section id="icu-test-rate" className={this.classes.chartSection}>
                        <h3>Percentage of simultaneous ICU patients for the amount of tests</h3>
                        <Testing
                            classes={this.classes}
                            testData={this.props.tests}
                            comparativeData={this.props.totalICU}
                            comparativeDataName="ICU patients"
                            chartName="Percentage of simultaneous ICU patients for the amount of tests"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.totalICU ?
                    <section id="rate-of-change-icu" className={this.classes.chartSection}>
                        <h3>Week by week change of patients in ICU</h3>
                        <p><small>How fast is the number of patients in ICU rising/falling (in %) ?</small></p>
                        <RateOfChange
                            classes={this.classes}
                            data={this.props.totalICU}
                            chartName="Week by week change of patients in ICU"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }
            </React.Fragment>
        );
    }
    Mortality() {
        return (
            <React.Fragment>
                <div style={{ marginTop: 20 }} />
                <Divider variant="middle" />
                <div style={{ marginTop: 20 }} />
                <Title id="mortality">Mortality</Title>

                {this.props.mortality ?
                    <section id="mortality" className={this.classes.chartSection}>
                        <h3>Number of deaths attributed to Covid-19, per day</h3>
                        <AveragedData
                            classes={this.classes}
                            data={this.props.mortality}
                            chartName="Deaths per day"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.mortality && this.props.tests ?
                    <section id="mortality-test-rate" className={this.classes.chartSection}>
                        <h3>Percentage of mortality for the amount of tests</h3>
                        <Testing
                            classes={this.classes}
                            testData={this.props.tests}
                            comparativeData={this.props.mortality}
                            comparativeDataName="Mortality"
                            chartName="Percentage of mortality for the amount of tests"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.mortality ?
                    <section id="rate-of-change-mortality" className={this.classes.chartSection}>
                        <h3>Week by week change of mortality</h3>
                        <p><small>How fast is the mortality rising/falling (in %) ?</small></p>
                        <RateOfChange
                            classes={this.classes}
                            data={this.props.mortality}
                            chartName="Week by week change of mortality"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }
            </React.Fragment>
        );
    }
}
