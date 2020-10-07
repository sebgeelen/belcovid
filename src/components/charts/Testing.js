import React from 'react';
import { getAveragePoints, getPolynomialRegressionPoints } from '../../helpers';
import LineChart from './LineChart';

export default class Testing extends React.Component {
    render() {
        let comparativeData = this.props.comparativeData;
        let testData = this.props.testData;
        const dates = this._getDates(comparativeData);
        const points = [];
        const rawComparativePoints = [];
        const rawTestPoints = [];
        let itemsYesterday = [];
        let start;
        let end;
        for (const date of dates) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
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
        const datasets = [
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} / test (7d rolling average)`,
                data: getAveragePoints(points, 7),
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points),
                borderColor: '#fc6868',
                backgroundColor: '#fc6868',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} / tests`,
                data: points,
                borderColor: '#decf3f',
                backgroundColor: '#decf3f',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: `${this.props.keyToCompare.toLowerCase()}`,
                data: rawComparativePoints,
                borderColor: '#846A6A',
                backgroundColor: '#846A6A',
                fill: false,
                radius: 0,
                yAxisID: 'right-y-axis'
            },
            {
                label: 'Tests',
                data: rawTestPoints,
                borderColor: '#63a088',
                backgroundColor: '#63a088',
                fill: false,
                radius: 0,
                yAxisID: 'right-y-axis',
            },
        ];
        const yAxes = [
            {
                id: 'left-y-axis',
                type: 'linear',
                position: 'left',
                ticks: {
                    autoSkip: true,
                    autoSkipPadding: 10,
                    source: 'auto',
                },
            },
            {
                id: 'right-y-axis',
                type: 'logarithmic',
                position: 'right',
                ticks: {
                    autoSkip: true,
                    autoSkipPadding: 10,
                    source: 'auto',
                    min: [...rawTestPoints, ...rawComparativePoints].map(p => p.y).filter(y => y).sort((a, b) => a - b)[0],
                },
            },
        ];
        const bounds = {
            x: {
                min: start,
                max: end,
            },
        };

        return (
            <LineChart
                datasets={datasets}
                yAxes={yAxes}
                bounds={bounds}
            />
        );
    }

    _getDates(data) {
        return new Set(data.map(item => item.DATE).filter(item => item));
    }
}
