import React from 'react';
import CasesByAge from './CasesByAge';
import LineChart from './LineChart';
import TestingChart from './TestingChart';
import RateOfChangeChart from './RateOfChangeChart';
import { Checkbox, Container, Divider, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, Tooltip } from '@material-ui/core';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import Title from '../Title';
import { Skeleton } from '@material-ui/lab';
import { provinces } from '../../data';

export const ZOOM_TOOLTIP = (<React.Fragment>
    <b>Zoom-in</b>: select<br/>
    <b>Zoom-out</b>: CTRL+select<br/>
    <br/>
    <u>Note</u>: currently doesn't work on mobile devices.
</React.Fragment>);


export default class Charts extends React.Component {
    state = {
        cases: false,
        hospitalizations: false,
        icu: false,
        mortality: false,
    }
    classes = this.props.classes;

    render() {
        return (
            <main className={this.classes.content}>
                <div className={this.classes.appBarSpacer} />
                <Container maxWidth="lg" className={this.classes.container}>
                    <Title>Charts for {provinces[this.props.province]}</Title>
                    <FormControl component="fieldset" className={this.classes.formControl}>
                        <FormLabel component="legend">Main variable</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox checked={this.state.cases} onChange={this._toggleVariable.bind(this, 'cases')} name="cases" />}
                                label="Cases"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={this.state.hospitalizations} onChange={this._toggleVariable.bind(this, 'hospitalizations')} name="hospitalizations" />}
                                label="Hospitalizations"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={this.state.icu} onChange={this._toggleVariable.bind(this, 'icu')} name="icu" />}
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
                    { this.state.hospitalizations && this.Hospitalizations() }
                    { this.state.icu && this.Icu() }
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

                {this.props.data ?
                    <section id="cases-age" style={{height: 400, marginBottom: 10}}>
                        <h3>New cases, by age group (7-day rolling average)</h3>
                        <IconButton aria-label="reset" size="small">
                            <RotateLeftIcon fontSize="inherit" />
                        </IconButton>
                        <CasesByAge data={this.props.data} startWeek={3} />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="positive-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of positive tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.cases}
                            keyToCompare="CASES"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="rate-of-change-cases">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in new cases</h3>
                        </Tooltip>
                        <p><small>How fast is the number of cases rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.cases}
                            keyToPlot="CASES"
                            chartName="New cases"
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

                {this.props.data ?
                    <section id="hospital-patients">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Patients at the hospital</h3>
                        </Tooltip>
                        <LineChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN"
                            chartName="Number of patients in the hospital"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="hospi-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of simultaneous hospital patients for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="rate-of-change-hospi">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in hospitalized patients</h3>
                        </Tooltip>
                        <p><small>How fast is the number of patients at the hospital rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN"
                            chartName="Hospitalized patients"
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

                {this.props.data ?
                    <section id="icu-patients">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Patients in intensive care</h3>
                        </Tooltip>
                        <LineChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN_ICU"
                            chartName="Number of patients in ICU"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="icu-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of simultaneous ICU patients for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN_ICU"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="rate-of-change-icu">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in patients in ICU</h3>
                        </Tooltip>
                        <p><small>How fast is the number of patients in ICU rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN_ICU"
                            chartName="Patients in ICU"
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

                {this.props.data ?
                    <section id="mortality">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Number of deaths attributed to Covid-19</h3>
                        </Tooltip>
                        <LineChart
                            data={this.props.data.mortality}
                            keyToPlot="DEATHS"
                            chartName="Deaths"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="mortality-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of mortality for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.mortality}
                            keyToCompare="DEATHS"
                        />
                    </section> :
                    <Skeleton variant="rect" height={200} />
                }

                {this.props.data ?
                    <section id="rate-of-change-mortality">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in mortality</h3>
                        </Tooltip>
                        <p><small>How fast is the mortality rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.mortality}
                            keyToPlot="DEATHS"
                            chartName="Deaths"
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
