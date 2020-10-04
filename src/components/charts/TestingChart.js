import React from 'react';
import { getAveragePoints, getPolynomialRegressionPoints, lastConsolidatedDataDay } from '../../helpers';
import CovidChart from './CovidChart';

export default class TestingChart extends React.Component {
    state = {
        min: new Date('2020-09-01'),
        max: lastConsolidatedDataDay(),
    };
    render() {
        let comparativeData = this.props.comparativeData;
        let testData = this.props.testData;
        if (this.state.min || this.state.max) {
            comparativeData = this._filterForRange(this.props.comparativeData);
            testData = this._filterForRange(this.props.testData);
        }
        const dates = this._getDates(comparativeData);
        const points = [];
        const rawComparativePoints = [];
        const rawTestPoints = [];
        let itemsYesterday = [];
        for (const date of dates) {
            const comparisons = comparativeData.filter(item => item.DATE === date);
            const tests = testData.filter(item => item.DATE === date);
            const totalTests = tests.reduce((a, b) => a + b.TESTS_ALL, 0);
            const testsYesterday = itemsYesterday.reduce((a, b) => a + b.TESTS_ALL, 0) || 0;
            const testsToday = totalTests - testsYesterday;
            if (testsToday) {
                const comparisonsToday = comparisons.reduce((a, b) => a + b[this.props.keyToCompare], 0) || 0;
                const formattedDate = new Date(date);
                rawTestPoints.push({ x: formattedDate, y: testsToday });
                rawComparativePoints.push({ x: formattedDate, y: comparisonsToday });
                points.push({ x: formattedDate, y: 100 * comparisonsToday / testsToday });
            }
            itemsYesterday = [...comparisons];
        }
        const data = [
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} / test (7d rolling average)`,
                data: getAveragePoints(points, 7),
                secondaryAxisID: 'rates',
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points),
                secondaryAxisID: 'rates',
            },
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} tests`,
                data: points,
                secondaryAxisID: 'rates',
            },
            {
                label: `${this.props.keyToCompare.toLowerCase()}`,
                data: rawComparativePoints,
                secondaryAxisID: 'raw',
            },
            {
                label: 'Tests',
                data: rawTestPoints,
                secondaryAxisID: 'raw',
            },
        ];
        const axes = [
            {
                primary: true,
                type: 'utc',
                position: 'bottom',
                hardMin: null,
                hardMax: null,
            },
            { type: 'linear', position: 'left', id: 'rates' },
            { type: 'log', position: 'right', id: 'raw' },
        ];

        return (
            // A react-chart hyper-responsively and continuously fills the available
            // space of its parent element automatically
            <div
                style={{
                    width: '90%',
                    height: '300px',
                }}
            >
                <CovidChart
                    data={data}
                    setDataRange={(min, max) => this.setState({ min, max })}
                    axes={axes}
                    min={this.state.min}
                    max={this.state.max}
                    primaryCursor secondaryCursor
                />
            </div>
        );
    }

    _filterForRange(data) {
        return data.filter(item => {
            const date = new Date(item.DATE);
            return (!this.state.min || date >= this.state.min) &&
                (!this.state.max || date <= this.state.max);
        });
    }
    _getDates(data) {
        return new Set(data.map(item => item.DATE).filter(item => item));
    }
}
