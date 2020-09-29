import React from 'react';
import Charts from './charts/Charts';
import DataTable from "./DataTable";

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
                        <li><a href="#mortality-test-rate">Percentage of mortality for the amount of tests</a></li>
                        </ul>
                    </div>

                    <section id="charts">
                        <Charts data={this.props.data}/>
                    </section>
                </main>
            );
        } else {
            return <p>Loading...</p>;
        }
    }
}
