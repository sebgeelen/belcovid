import React from 'react';
import { getAveragePoints, getDateFrom, getPolynomialRegressionPoints, lastConsolidatedDataDay } from '../../helpers';
import LineChart from './LineChart';

const regressionStart = getDateFrom(lastConsolidatedDataDay(), -28);
export default class AveragedData extends React.Component {
    render() {
        let data = this.props.data;
        const points = [];
        let start;
        let end;
        for (const date of Object.keys(data)) {
            // Ignore the data if it concerns days beyond the limit set in
            // props.
            if (this.props.max && new Date(date) > this.props.max) continue;
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
            const items = data[date];
            points.push({
                x: new Date(date),
                y: typeof items === 'object' ? items.total : items,
            });
        }
        const averagedPoints = getAveragePoints(points, 7);
        const regressionPoints = getPolynomialRegressionPoints(averagedPoints.filter(p => {
            return p.x >= regressionStart;
        }), 3);
        const yValues = [...averagedPoints, ...regressionPoints, ...points].map(p => p.y).filter(a => a).sort((a, b) => a - b);
        const datasets = [
            {
                label: `${this.props.chartName} (weekly average)`,
                data: averagedPoints,
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
            },
            {
                label: 'Trend line',
                data: regressionPoints,
                borderColor: '#fc6868',
                backgroundColor: '#fc6868',
                fill: false,
                radius: 0,
            },
            {
                label: `${this.props.chartName}`,
                data: points,
                borderColor: '#decf3f',
                backgroundColor: '#decf3f',
                fill: false,
                radius: 0,
            },
        ];
        const bounds = {
            x: {
                min: start,
                max: end,
            },
            y: {
                min: 0,
                // Round up to the nearest thousand.
                max: Math.ceil((yValues[yValues.length - 1] + 10) / 1000) * 1000,
            },
        };
        return <LineChart
            classes={this.props.classes}
            chartName={this.props.chartName}
            datasets={datasets}
            bounds={bounds}
            logarithmic={true}
            asImage={this.props.asImage}
            labelStrings={this.props.labelStrings}
        />;
    }
}
