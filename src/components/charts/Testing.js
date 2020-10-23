import React from 'react';
import { getAveragePoints, getPolynomialRegressionPoints } from '../../helpers';
import LineChart from './LineChart';

const regressionStart = new Date('2020-08-15');
export default class Testing extends React.Component {
    render() {
        let comparativeData = this.props.comparativeData;
        let testData = this.props.testData;
        const dates = Object.keys(comparativeData);
        const points = [];
        const rawComparativePoints = [];
        const rawTestPoints = [];
        let start;
        let end;
        for (const date of dates) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
            let dataToday = comparativeData[date];
            if (typeof dataToday === 'object') {
                dataToday = comparativeData[date].total;
            }
            const testsToday = testData[date];
            const formattedDate = new Date(date);
            rawTestPoints.push({
                x: formattedDate,
                y: testsToday,
            });
            rawComparativePoints.push({
                x: formattedDate,
                y: dataToday,
            });
            points.push({
                x: formattedDate,
                y: 100 * dataToday / testsToday,
            });
        }
        const datasets = [
            {
                label: `${this.props.chartName}`,
                data: getAveragePoints(points, 7),
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points.filter(p => p.x >= regressionStart), 2),
                borderColor: '#fc6868',
                backgroundColor: '#fc6868',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: `${this.props.chartName}`,
                data: points,
                borderColor: '#decf3f',
                backgroundColor: '#decf3f',
                fill: false,
                radius: 0,
                yAxisID: 'left-y-axis'
            },
            {
                label: `${this.props.comparativeDataName}`,
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
                classes={this.props.classes}
                chartName={this.props.chartName}
                datasets={datasets}
                yAxes={yAxes}
                bounds={bounds}
                annotations={this.props.annotations}
                asImage={this.props.asImage}
            />
        );
    }
}
