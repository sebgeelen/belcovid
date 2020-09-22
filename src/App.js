import React from 'react';
import PeopleInHospitalChart from './components/PeopleInHospitalChart.js';
import CasesByTestChart from './components/CasesByTestChart.js';
import DataTable from './components/DataTable.js';
import InputRange from 'react-input-range';
import { LINK_HOSPI, LINK_TOTAL_TESTS, LINK_CASES, getDateFrom } from './helpers';
import 'react-input-range/lib/css/index.css';
import './App.css';

export default class App extends React.Component {
  state = {
    hospiWeeks: 3,
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
          <h2>Patients at the hospital (last {this.state.hospiWeeks > 1 ? this.state.hospiWeeks + ' weeks' : 'week'})</h2>
          <InputRange
            minValue={1}
            maxValue={this.state.weeksSinceStart}
            value={this.state.hospiWeeks}
            onChange={value => this.setState({ hospiWeeks: value })} />
          <PeopleInHospitalChart data={this.state.data} start={getDateFrom(new Date(), -1 - (this.state.hospiWeeks * 7))} />
        </section>}

        {this.state.data &&
        <section>
          <h2>Percentage of positive tests (last {this.state.caseByTestsWeeks > 1 ? this.state.caseByTestsWeeks + ' weeks' : 'week'})</h2>
          <InputRange
            minValue={1}
            maxValue={this.state.weeksSinceStart}
            value={this.state.caseByTestsWeeks}
            onChange={value => this.setState({ caseByTestsWeeks: value })} />
          <CasesByTestChart data={this.state.data} start={getDateFrom(new Date(), -1 - (this.state.caseByTestsWeeks * 7))} />
        </section>}
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
    const firstDay = cases.reduce((a, b) => {
      return Date.parse(a.DATE) > Date.parse(b.DATE) ? b : a;
    }).DATE;
    const weeksSinceStart = Math.ceil((new Date().getTime() - new Date(firstDay).getTime()) / (1000 * 60 * 60 * 24 * 7));
    this.setState({
      data: { hospi, tests, cases },
      weeksSinceStart
    });
  }
  _onChangeHospiRange(value) {
    this.setState({ hospiWeeks: value });
  }
  _onChangeCaseByTestRange(value) {
    this.setState({ caseByTestsWeeks: value });
  }
}
