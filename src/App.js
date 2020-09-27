import React from 'react';
import { LINK_HOSPI, LINK_TOTAL_TESTS, LINK_CASES, getDaysBetween } from './helpers';
import MainContent from './components/MainContent.js';
import './App.css';

const HEADER = <h1 style={{ textAlign: 'center' }}>BelCovid</h1>;
const FOOTER = <footer>All data from <a href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</a> •
Official national <a href="https://www.info-coronavirus.be/">information on Covid-19</a>.</footer>;

export default class App extends React.Component {
  state = {};
  render() {
    return (
      <div>
        {HEADER}
        <MainContent data={this.state.data}/>
        {FOOTER}
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
