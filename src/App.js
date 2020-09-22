import React from 'react';
import PeopleInHospitalChart from './PeopleInHospitalChart.js';
import CasesByTestChart from './CasesByTestChart.js';
import './App.css';

const LINK_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json';
const LINK_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json';
const LINK_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json';
const AVAILABLE_BEDS = 61600;

class App extends React.Component {
  state = {
    hospiWeeks: 3,
    caseByTestsMonths: 3,
  };
  render() {
    return (
      <div>
        <h1>BelCovid</h1>
        {this.state.saturationDay && <section>
          <h2>Projected day of hospital saturation</h2>
          <p>{this.state.saturationDay}</p>
        </section>}
        {this.state.data && <section>
          <h2>Patients at the hospital (last <input type="number" value={this.state.hospiWeeks} onChange={this._onChangeHospiWeeks.bind(this)}></input> weeks)</h2>
          <PeopleInHospitalChart data={this.state.data} start={new Date().setDate(new Date().getDate() - (this.state.hospiWeeks * 7) - 1)} />
        </section>}
        {this.state.data && <section>
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
  async getSaturationDay() {
      const hospiData = this.state.data?.hospi;
      if (!hospiData) return;
      const today = new Date();
      const day2 = new Date(today.setDate(today.getDate() - 1)).toISOString().substring(0, 10);
      const day1 = new Date(today.setDate(today.getDate() - 1)).toISOString().substring(0, 10);
      const hospiDay1 = hospiData.filter(item => item.DATE === day1).map(item => item.TOTAL_IN).reduce((a, b) => a + b, 0);
      const hospiDay2 = hospiData.filter(item => item.DATE === day2).map(item => item.TOTAL_IN).reduce((a, b) => a + b, 0);
      if (!hospiDay2 || hospiDay1 === hospiDay2) return;
      const pcChange = (hospiDay2 - hospiDay1) / hospiDay1;
      const daysToSaturation = Math.log(AVAILABLE_BEDS / hospiDay2) / Math.log((1 + pcChange));
      const saturationDay = new Date(today.setDate(today.getDate() + 1 + daysToSaturation));
      this.setState({ saturationDay: saturationDay.toDateString() });
  }

  async _updateData() {
    const hospi = await (await fetch(LINK_HOSPI)).json();
    const tests = await (await fetch(LINK_TOTAL_TESTS)).json();
    const cases = await (await fetch(LINK_CASES)).json();
    this.setState({
      data: { hospi, tests, cases },
    });
    this.getSaturationDay();
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
