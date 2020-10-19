import React from 'react';
import CasesByAge from './CasesByAge';
import AveragedData from './AveragedData';
import Testing from './Testing';
import RateOfChange from './RateOfChange';
import { Checkbox, Container, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, Tooltip } from '@material-ui/core';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { PROVINCES } from '../../data';

export default class Charts extends React.Component {
    state = {
        cases: false,
        totalHospitalizations: false,
        totalICU: false,
        mortality: false,
    }
    classes = this.props.classes;

    render() {
        return (
            <main className={this.classes.content}>
                <div className={this.classes.appBarSpacer} />
                <Container maxWidth="lg" className={this.classes.container}>
                    <Title>Charts for {PROVINCES[this.props.province]}</Title>
                    <FormControl component="fieldset" className={this.classes.formControl}>
                        <FormLabel component="legend">Main variable</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={this.state.cases} onChange={this._toggleVariable.bind(this, 'cases')} name="cases" />}
                                label="Cases"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={this.state.totalHospitalizations} onChange={this._toggleVariable.bind(this, 'hospitalizations')} name="hospitalizations" />}
                                label="Hospitalizations"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={this.state.totalICU} onChange={this._toggleVariable.bind(this, 'icu')} name="icu" />}
                                label="Intensive Care Units"
                            />
                            <Tooltip title="Mortality data cannot be filtered per province.">
                                <FormControlLabel
                                    control={
                                            <Checkbox
                                                checked={this.state.mortality}
                                                onChange={this._toggleVariable.bind(this, 'mortality')}
                                                name="mortality"
                                                disabled={this.props.province !== 'Belgium'}
                                            />
                                        }
                                    label="Mortality"
                                />
                            </Tooltip>
                        </FormGroup>
                    </FormControl>
                    { this.state.cases && this.Cases() }
                    { this.state.totalHospitalizations && this.Hospitalizations() }
                    { this.state.totalICU && this.Icu() }
                    { this.state.mortality && this.Mortality() }
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
                            chartName="Percentage of positive tests"
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
                            comparativeData={this.props.totalHospitalisations}
                            chartName="Percentage of simultaneous hospital patients for the amount of tests"
                            asImage={true}
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.totalHospitalisations ?
                    <section id="rate-of-change-hospi" className={this.classes.chartSection}>
                        <h3>Week by week change of hospitalized patients</h3>
                        <p><small>How fast is the number of patients at the hospital rising/falling (in %) ?</small></p>
                        <RateOfChange
                            classes={this.classes}
                            data={this.props.totalHospitalisations}
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
    _toggleVariable(variable) {
        this.setState({ [variable]: !this.state[variable] });
    }
}
