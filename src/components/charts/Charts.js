import React from 'react';
import CasesByAgeChart from './CasesByAgeChart';
import LineChart from './LineChart';
import TestingChart from './TestingChart';
import RateOfChangeChart from './RateOfChangeChart';
import { Container, Tooltip } from '@material-ui/core';
import Title from '../Title';

export const ZOOM_TOOLTIP = (<React.Fragment>
    <b>Zoom-in</b>: select<br/>
    <b>Zoom-out</b>: CTRL+select<br/>
    <br/>
    <u>Note</u>: currently doesn't work on mobile devices.
</React.Fragment>);


export default class Charts extends React.Component {
    classes = this.props.classes;

    render() {
        let main;
        if (this.props.data) {
            main = (
                <React.Fragment>
                    <Title>Cases</Title>

                    <section id="cases-age">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>New cases, by age group (7-day rolling average)</h3>
                        </Tooltip>
                        <CasesByAgeChart data={this.props.data} />
                    </section>

                    <section id="positive-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of positive tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.cases}
                            keyToCompare="CASES"
                            startWeek={3}
                        />
                    </section>

                    <section id="rate-of-change-cases">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in new cases</h3>
                        </Tooltip>
                        <p><small>How fast is the number of cases rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.cases}
                            keyToPlot="CASES"
                            startWeek={3}
                            chartName="New cases"
                        />
                    </section>

                    <h2 id="hospi">Hospitalizations</h2>
                    <p><small>We count here in number of patients that are hospitalized <i>simultaneously</i> (not just new admissions).</small></p>

                    <section id="hospital-patients">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Patients at the hospital</h3>
                        </Tooltip>
                        <LineChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN"
                            startWeek={3}
                            chartName="Number of patients in the hospital"
                        />
                    </section>

                    <section id="hospi-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of simultaneous hospital patients for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN"
                            startWeek={3}
                        />
                    </section>

                    <section id="rate-of-change-hospi">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in hospitalized patients</h3>
                        </Tooltip>
                        <p><small>How fast is the number of patients at the hospital rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN"
                            startWeek={3}
                            chartName="Hospitalized patients"
                        />
                    </section>

                    <h2 id="icu">Intensive Care Units</h2>
                    <p><small>We count here in number of patients that are <i>simultaneously</i> in ICU (not just new admissions).</small></p>

                    <section id="icu-patients">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Patients in intensive care</h3>
                        </Tooltip>
                        <LineChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN_ICU"
                            startWeek={3}
                            chartName="Number of patients in ICU"
                        />
                    </section>

                    <section id="icu-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of simultaneous ICU patients for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN_ICU"
                            startWeek={3}
                        />
                    </section>

                    <section id="rate-of-change-icu">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Rate of change in patients in ICU</h3>
                        </Tooltip>
                        <p><small>How fast is the number of patients in ICU rising/falling (in %) ?</small></p>
                        <RateOfChangeChart
                            data={this.props.data.hospitalisations}
                            keyToPlot="TOTAL_IN_ICU"
                            startWeek={3}
                            chartName="Patients in ICU"
                        />
                    </section>

                    <h2 id="mortality">Mortality</h2>

                    <section id="mortality-test-rate">
                        <Tooltip title={ZOOM_TOOLTIP} placement="bottom-start" arrow>
                            <h3>Percentage of mortality for the amount of tests</h3>
                        </Tooltip>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.mortality}
                            keyToCompare="DEATHS"
                            startWeek={3}
                        />
                    </section>
                </React.Fragment>
            );
        } else {
            main = <p>Loading...</p>;
        }
        return (
            <main className={this.classes.content}>
                <div className={this.classes.appBarSpacer} />
                <Container maxWidth="lg" className={this.classes.container}>
                    {main}
                </Container>
            </main>
        );
    }
}
