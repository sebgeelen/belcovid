import React from 'react';
import PeopleInHospitalChart from './PeopleInHospitalChart.js';
import CasesByTestChart from './CasesByTestChart.js';
import DataTable from './DataTable.js';
import { LINK_HOSPI, LINK_TOTAL_TESTS, LINK_CASES } from './helpers';
import './App.css';

class App extends React.Component {
  state = {
    hospiWeeks: 3,
    caseByTestsMonths: 3,
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
          <h2>Patients at the hospital (last <input type="number" value={this.state.hospiWeeks} onChange={this._onChangeHospiWeeks.bind(this)}></input> weeks)</h2>
          <PeopleInHospitalChart data={this.state.data} start={new Date().setDate(new Date().getDate() - (this.state.hospiWeeks * 7) - 1)} />
        </section>}

        {this.state.data &&
        <section>
          <h2>Percentage of positive tests (last <input type="number" value={this.state.caseByTestsMonths} onChange={this._onChangeCaseByTestMonths.bind(this)}></input> months)</h2>
          <CasesByTestChart data={this.state.data} start={new Date().setDate(new Date().getDate() - (this.state.caseByTestsMonths * 31) - 1)} />
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
    this.setState({
      data: { hospi, tests, cases },
    });
  }
  _onChangeHospiWeeks(e) {
    const value = +e.target.value;
    this.setState({
      hospiWeeks: value > 0 ? value : 0 || 0,
    });
  }
  _onChangeCaseByTestMonths(e) {
    const value = +e.target.value;
    this.setState({
      caseByTestsMonths: value > 0 ? value : 0 || 0,
    });
  }
}

export default App;
