import React from 'react';
import { getDateFrom, getPolynomialRegressionPoints, normalizeDate } from '../../helpers';
import LineChart from './LineChart';

const regressionStart = new Date('2020-08-15');
export default class RateOfChange extends React.Component {
    render() {
        let data = [...this.props.data] || [];
        const dates = new Set(data?.map(item => item.DATE).filter(item => item));
        const points = new Map();
        let start;
        let end;
        for (const date of dates) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
            const items = data.filter(item => item.DATE === date);
            const patients = items.reduce((a, b) => a + b[this.props.keyToPlot], 0) || 0;
            points.set(normalizeDate(new Date(date)).getTime(), patients);
        }
        const weeklyPoints = [];
        let pointIndex = 0;
        for (const date of points.keys()) {
            if (pointIndex >= 6) {
                let y = 0;
                let comparativeDate = new Date(date);
                for (let i = 0; i < 7; i++) {
                    const value = points.get(comparativeDate.getTime());
                    y += value;
                    comparativeDate = normalizeDate(getDateFrom(new Date(comparativeDate), -1));
                }
                weeklyPoints.push({
                    x: new Date(date),
                    y,
                });
            }
            pointIndex++;
        }
        const rateOfChangePoints = weeklyPoints.map((point, index) => {
            let y;
            if (index >= 6 && weeklyPoints[index - 6]) {
                y = this._getChangeRatio(point.y, weeklyPoints[index - 6].y);
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
            annotations={annotations}
            asImage={this.props.asImage}
        />;
    }
    /**
     * Return the change ratio between two numerical values, in percentage.
     *
     * @param {number} newValue
     * @param {number} oldValue
     * @returns {number}
     */
    _getChangeRatio(newValue, oldValue) {
        if (oldValue === 0) {
            if (newValue === 0) {
                // If we come from 0 and stay at 0, the rate of change is 0.
                return 0;
            } else {
                // If we come from 0 and get to a different value, the rate of
                // change is undefined.
                return;
            }
        } else {
            const sign = newValue > oldValue ? 1 : -1;
            return sign * 100 * ((newValue / oldValue) - 1);
        }
    }
}
