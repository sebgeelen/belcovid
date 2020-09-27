import React from 'react';
import ReactTooltip from 'react-tooltip';
import CasesByAgeChart from './CasesByAgeChart';
import CasesByTestChart from './CasesByTestChart';
import DataTable from "./DataTable";
import PatientsInHospitalChart from './PatientsInHospitalChart';
import PatientsInICUChart from './PatientsInICUChart';

const ZOOM_TOOLTIP = `Zoom-in: select<br>Zoom-out: CTRL+select<br><br>Note: currently doesn't work on mobile devices.`;

export default class MainContent extends React.Component {
    render() {
        if (this.props.data) {
            return (
                <main>
                    <section>
                        <h2>Today {new Date().toDateString()}</h2>
                        <DataTable data={this.props.data} />
                    </section>

                    <div style={{ textAlign: 'center' }}>
                        <h2>Charts</h2>
                        <ul style={{ listStyle: 'none' }}>
                        <li><a href="#cases-age">New cases, by age group (7-day rolling average)</a></li>
                        <li><a href="#hospital-patients">Patients at the hospital</a></li>
                        <li><a href="#icu-patients">Patients in intensive care</a></li>
                        <li><a href="#positive-test-rate">Percentage of positive tests</a></li>
                        </ul>
                    </div>

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
                        <CasesByTestChart data={this.props.data} />
                    </section>
                </main>
            );
        } else {
            return <p>Loading...</p>;
        }
    }
}
