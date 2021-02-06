import React from 'react';
import { getWeeklyData } from '../../data/data';
import {
    getChangeRatio,
    getDateFrom,
    getPolynomialRegressionPoints,
    lastConsolidatedDataDay,
} from '../../helpers';
import LineChart from './LineChart';

const regressionStart = getDateFrom(lastConsolidatedDataDay(), -28);
export default class RateOfChange extends React.Component {
    render() {
        let data = this.props.data;
        const weeklyData = getWeeklyData(data);
        const weeklyPoints = [];
        let start;
        let end;
        for (const date of Object.keys(weeklyData)) {
            // Ignore the data if it concerns days beyond the limite set in
            // props.
            if (this.props.max && new Date(date) > this.props.max) continue;
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
            const value = weeklyData[date];
            weeklyPoints.push({
                x: new Date(date),
                y: typeof value === 'object' ? value.total : value,
            });
        }
        const rateOfChangePoints = weeklyPoints.map((point, index) => {
            let y;
            if (index >= 6 && weeklyPoints[index - 6]) {
                y = getChangeRatio(point.y, weeklyPoints[index - 6].y);
            }
            if (y !== undefined) {
                return {
                    x: point.x,
                    y,
                };
            } else {
                return undefined;
            }
        }).filter(d => d && typeof d.y === 'number');
        const datasets = [
            {
                label: this.props.chartName,
                data: rateOfChangePoints,
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(rateOfChangePoints.filter(d => d.x >= regressionStart), 2),
                borderColor: '#fc6868',
                backgroundColor: '#fc6868',
                fill: false,
                radius: 0,
            },
        ];
        const bounds = {
            x: {
                min: start,
                max: end,
            },
        };
        const annotations = [{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: '0',
            borderColor: 'black',
            borderDash: [2, 2],
            borderWidth: 2,
        }];

        return <LineChart
            classes={this.props.classes}
            chartName={this.props.chartName}
            datasets={datasets}
            bounds={bounds}
            annotations={[...(this.props.annotations || []), ...annotations]}
            asImage={this.props.asImage}
            labelStrings={{y: '% / week'}}
        />;
    }
}
