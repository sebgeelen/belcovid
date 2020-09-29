import React from 'react';
import ReactTooltip from 'react-tooltip';
import CasesByAgeChart from './CasesByAgeChart';
import PatientsInHospitalChart from './PatientsInHospitalChart';
import PatientsInICUChart from './PatientsInICUChart';
import TestingChart from './TestingChart';

export const ZOOM_TOOLTIP = `Zoom-in: select<br>Zoom-out: CTRL+select<br><br>Note: currently doesn't work on mobile devices.`;

export default class Charts extends React.Component {
    render() {
        if (this.props.data) {
            return (
                <div>
                    <section id="cases-age">
                        <h2 data-tip={ZOOM_TOOLTIP}>New cases, by age group (7-day rolling average)</h2>
                        <ReactTooltip multiline/>
                        <CasesByAgeChart data={this.props.data} />
                    </section>

                    <section id="hospital-patients">
                        <h2 data-tip={ZOOM_TOOLTIP}>Patients at the hospital</h2>
                        <ReactTooltip multiline/>
                        <PatientsInHospitalChart data={this.props.data} />
                    </section>

                    <section id="icu-patients">
                        <h2 data-tip={ZOOM_TOOLTIP}>Patients in intensive care</h2>
                        <ReactTooltip multiline/>
                        <PatientsInICUChart data={this.props.data} />
                    </section>

                    <section id="positive-test-rate">
                        <h2 data-tip={ZOOM_TOOLTIP}>Percentage of positive tests</h2>
                        <ReactTooltip multiline/>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.cases}
                            keyToCompare="CASES"
                        />
                    </section>

                    <section id="mortality-test-rate">
                        <h2 data-tip={ZOOM_TOOLTIP}>Percentage of mortality for the amount of tests</h2>
                        <ReactTooltip multiline/>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.mortality}
                            keyToCompare="DEATHS"
                        />
                    </section>

                    <section id="hospi-test-rate">
                        <h2 data-tip={ZOOM_TOOLTIP}>Percentage of simultaneous hospital patients for the amount of tests</h2>
                        <ReactTooltip multiline/>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN"
                        />
                    </section>

                    <section id="icu-test-rate">
                        <h2 data-tip={ZOOM_TOOLTIP}>Percentage of simultaneous ICU patients for the amount of tests</h2>
                        <ReactTooltip multiline/>
                        <TestingChart
                            testData={this.props.data.tests}
                            comparativeData={this.props.data.hospitalisations}
                            keyToCompare="TOTAL_IN_ICU"
                        />
                    </section>
                </div>
            );
        } else {
            return null;
        }
    }
}
