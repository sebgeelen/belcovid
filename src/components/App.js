import React from 'react';
import MainContent from './MainContent.js';
import '../App.css';
import { fetchAllData } from '../data';

const HEADER = <h1 style={{ textAlign: 'center' }}>BelCovid</h1>;
const FOOTER = <footer>All data from <a href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</a> •
Official national <a href="https://www.info-coronavirus.be/">information on Covid-19</a>.</footer>;

export default class App extends React.Component {
  state = {};
  async componentDidMount() {
    const data = await fetchAllData();
    this.setState({ data });
  }
  render() {
    return (
      <div>
        {HEADER}
        <MainContent data={this.state.data}/>
        {FOOTER}
      </div>
    );
  }
}
