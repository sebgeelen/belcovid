import React from 'react';
import ReactTooltip from 'react-tooltip';
import CasesByAgeChart from './CasesByAgeChart';
import LineChart from './LineChart';
import TestingChart from './TestingChart';
import RateOfChangeChart from './RateOfChangeChart';

export const ZOOM_TOOLTIP = `Zoom-in: select<br>Zoom-out: CTRL+select<br><br>Note: currently doesn't work on mobile devices.`;

export default class Charts extends React.Component {
    render() {
        return (
            <div>
                <h2 id="cases">Cases</h2>

                <section id="cases-age">
                    <h3 data-tip={ZOOM_TOOLTIP}>New cases, by age group (7-day rolling average)</h3>
                    <ReactTooltip multiline/>
                    <CasesByAgeChart data={this.props.data} />
                </section>

                <section id="positive-test-rate">
                    <h3 data-tip={ZOOM_TOOLTIP}>Percentage of positive tests</h3>
                    <ReactTooltip multiline/>
                    <TestingChart
                        testData={this.props.data.tests}
                        comparativeData={this.props.data.cases}
                        keyToCompare="CASES"
                        startWeek={3}
                    />
                </section>

                <section id="rate-of-change-cases">
                    <h3 data-tip={ZOOM_TOOLTIP}>Rate of change in new cases</h3>
                    <p><small>How fast is the number of cases rising/falling (in %) ?</small></p>
                    <ReactTooltip multiline/>
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
                    <h3 data-tip={ZOOM_TOOLTIP}>Patients at the hospital</h3>
                    <ReactTooltip multiline/>
                    <LineChart
                        data={this.props.data.hospitalisations}
                        keyToPlot="TOTAL_IN"
                        startWeek={3}
                        chartName="Number of patients in the hospital"
                    />
                </section>

                <section id="hospi-test-rate">
                    <h3 data-tip={ZOOM_TOOLTIP}>Percentage of simultaneous hospital patients for the amount of tests</h3>
                    <ReactTooltip multiline/>
                    <TestingChart
                        testData={this.props.data.tests}
                        comparativeData={this.props.data.hospitalisations}
                        keyToCompare="TOTAL_IN"
                        startWeek={3}
                    />
                </section>

                <section id="rate-of-change-hospi">
                    <h3 data-tip={ZOOM_TOOLTIP}>Rate of change in hospitalized patients</h3>
                    <p><small>How fast is the number of patients at the hospital rising/falling (in %) ?</small></p>
                    <ReactTooltip multiline/>
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
                    <h3 data-tip={ZOOM_TOOLTIP}>Patients in intensive care</h3>
                    <ReactTooltip multiline/>
                    <LineChart
                        data={this.props.data.hospitalisations}
                        keyToPlot="TOTAL_IN_ICU"
                        startWeek={3}
                        chartName="Number of patients in ICU"
                    />
                </section>

                <section id="icu-test-rate">
                    <h3 data-tip={ZOOM_TOOLTIP}>Percentage of simultaneous ICU patients for the amount of tests</h3>
                    <ReactTooltip multiline/>
                    <TestingChart
                        testData={this.props.data.tests}
                        comparativeData={this.props.data.hospitalisations}
                        keyToCompare="TOTAL_IN_ICU"
                        startWeek={3}
                    />
                </section>

                <section id="rate-of-change-icu">
                    <h3 data-tip={ZOOM_TOOLTIP}>Rate of change in patients in ICU</h3>
                    <p><small>How fast is the number of patients in ICU rising/falling (in %) ?</small></p>
                    <ReactTooltip multiline/>
                    <RateOfChangeChart
                        data={this.props.data.hospitalisations}
                        keyToPlot="TOTAL_IN_ICU"
                        startWeek={3}
                        chartName="Patients in ICU"
                    />
                </section>

                <h2 id="mortality">Mortality</h2>

                <section id="mortality-test-rate">
                    <h3 data-tip={ZOOM_TOOLTIP}>Percentage of mortality for the amount of tests</h3>
                    <ReactTooltip multiline/>
                    <TestingChart
                        testData={this.props.data.tests}
                        comparativeData={this.props.data.mortality}
                        keyToCompare="DEATHS"
                        startWeek={3}
                    />
                </section>
            </div>
        );
    }
}
