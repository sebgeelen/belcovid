import React from 'react';
import PatientsInHospitalChart from './components/PatientsInHospitalChart.js';
import CasesByTestChart from './components/CasesByTestChart.js';
import DataTable from './components/DataTable.js';
import InputRange from 'react-input-range';
import { LINK_HOSPI, LINK_TOTAL_TESTS, LINK_CASES, getDateFrom, getDaysBetween, today } from './helpers';
import 'react-input-range/lib/css/index.css';
import './App.css';
import PatientsInICUChart from './components/PatientsInICUChart.js';
import CasesByAgeChart from './components/CasesByAgeChart.js';
import ReactTooltip from 'react-tooltip';

export default class App extends React.Component {
  state = {
    hospiWeeks: 3,
    icuWeeks: 3,
    caseByTestsWeeks: 12,
  };
  render() {
    return (
      <div>
        <h1 style={{ textAlign: 'center' }}>BelCovid</h1>

        {!this.state.data && <p>Loading...</p>}

        {this.state.data &&
        <section>
          <h2>Today {new Date().toDateString()}</h2>
          <DataTable data={this.state.data} />
        </section>}

        {this.state.data &&
        <section>
          <h2 data-tip={`Zoom-in: select<br>Zoom-out: CTRL+select<br><br>Note: currently doesn't work on mobile devices.`}>New cases, by age group (7-day rolling average)</h2>
          <ReactTooltip multiline/>
          <CasesByAgeChart data={this.state.data} />
        </section>}

        {this.state.data &&
        <section>
          <h2>Patients at the hospital (last {this.state.hospiWeeks > 1 ? this.state.hospiWeeks + ' weeks' : 'week'})</h2>
          <InputRange
            minValue={1}
            maxValue={this.state.weeksSinceStart}
            value={this.state.hospiWeeks}
            onChange={value => this.setState({ hospiWeeks: value })} />
          <PatientsInHospitalChart data={this.state.data} start={getDateFrom(today(), -(this.state.hospiWeeks * 7))} />
        </section>}

        {this.state.data &&
        <section>
          <h2>Patients in intensive care (last {this.state.icuWeeks > 1 ? this.state.icuWeeks + ' weeks' : 'week'})</h2>
          <InputRange
            minValue={1}
            maxValue={this.state.weeksSinceStart}
            value={this.state.icuWeeks}
            onChange={value => this.setState({ icuWeeks: value })} />
          <PatientsInICUChart data={this.state.data} start={getDateFrom(today(), -(this.state.icuWeeks * 7))} />
        </section>}

        {this.state.data &&
        <section>
          <h2>Percentage of positive tests (last {this.state.caseByTestsWeeks > 1 ? this.state.caseByTestsWeeks + ' weeks' : 'week'})</h2>
          <InputRange
            minValue={1}
            maxValue={this.state.weeksSinceStart}
            value={this.state.caseByTestsWeeks}
            onChange={value => this.setState({ caseByTestsWeeks: value })} />
          <CasesByTestChart data={this.state.data} start={getDateFrom(today(), -(this.state.caseByTestsWeeks * 7))} />
        </section>}

        <footer>All data from <a href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</a> •
        Official national <a href="https://www.info-coronavirus.be/">information on Covid-19</a>.</footer>
      </div>
    );
  }
  componentDidMount() {
    this._updateData();
    setInterval(this._updateData.bind(this), 1000 * 60 * 60);
  }

  async _updateData() {
    const hospi = await (await fetch(LINK_HOSPI)).json();
    const tests = await (await fetch(LINK_TOTAL_TESTS)).json();
    const cases = await (await fetch(LINK_CASES)).json();
    const weeksSinceStart = Math.ceil(getDaysBetween(new Date(), this._getFirstDay(cases)) / 7);
    this.setState({
      data: { hospi, tests, cases },
      weeksSinceStart
    });
  }
  _getFirstDay(data) {
    return new Date(data.reduce((a, b) => {
      return Date.parse(a.DATE) > Date.parse(b.DATE) ? b : a;
    }).DATE);
  }
  _onChangeHospiRange(value) {
    this.setState({ hospiWeeks: value });
  }
  _onChangeCaseByTestRange(value) {
    this.setState({ caseByTestsWeeks: value });
  }
}
