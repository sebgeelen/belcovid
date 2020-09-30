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

                    <section>
                        <h2>Table of Charts</h2>
                        <ul style={{ listStyle: 'none' }}>
                            <li>
                                <a href="#cases">Cases</a>
                                <ul style={{ listStyle: 'none' }}>
                                    <li><a href="#cases-age">New cases, by age group (7-day rolling average)</a></li>
                                    <li><a href="#positive-test-rate">Case/test ratio</a></li>
                                    <li><a href="#rate-of-change-cases">Rate of change</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="#hospi">Hospitalizations</a>
                                <ul style={{ listStyle: 'none' }}>
                                    <li><a href="#hospital-patients">Total in hospital</a></li>
                                    <li><a href="#hospi-test-rate">Total in hospital/test ratio</a></li>
                                    <li><a href="#rate-of-change-hospi">Rate of change</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="#icu">Intensive Care Units</a>
                                <ul style={{ listStyle: 'none' }}>
                                    <li><a href="#icu-patients">Total in ICU</a></li>
                                    <li><a href="#icu-test-rate">Total in ICU/test ratio</a></li>
                                    <li><a href="#rate-of-change-icu">Rate of change</a></li>
                                </ul>
                            </li>
                            <li>
                                <a href="#mortality">Mortality</a>
                                <ul style={{ listStyle: 'none' }}>
                                    <li><a href="#mortality-test-rate">Mortality/test ratio</a></li>
                                </ul>
                            </li>
                        </ul>
                    </section>

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
