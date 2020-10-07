import React from 'react';
import { getAveragePoints, getPolynomialRegressionPoints } from '../../helpers';
import LineChart from './LineChart';

export default class RateOfChange extends React.Component {
    render() {
        let data = [...this.props.data] || [];
        const dates = new Set(data?.map(item => item.DATE).filter(item => item));
        const points = [];
        let start;
        let end;
        for (const date of dates) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > start) end = new Date(date);
            const items = data.filter(item => item.DATE === date);
            const patients = items.reduce((a, b) => a + b[this.props.keyToPlot], 0) || 0;
            points.push({x: new Date(date), y: patients});
        }
        const rateOfChangePoints = getAveragePoints(points, 7).map((point, index) => {
            return index && this._getRateOfChangePoint(points, index, 2);
        }).filter(d => d && typeof d.y === 'number');
        const datasets = [
            {
                label: `Rate of change of ${this.props.chartName.toLowerCase()} (7-day rolling average)`,
                data: getAveragePoints([...rateOfChangePoints], 7),
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints([...rateOfChangePoints], 2),
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

        return <LineChart datasets={datasets} bounds={bounds} />;
    }
    /**
     * Returns a point of format `{ x: any, y: number }` with `x` being whatever
     * if is at `points[index]` and `y` being the rate of change (expressed in
     * %) between `points[index]]` and `points[index - interval + 1]`.
     *
     * @param {object[]} points
     * @param {number} index
     * @param {number} interval
     * @returns {object}
     */
    _getRateOfChangePoint(points, index) {
        const oldPointY = points[index - 1]?.y;
        let newPointY = points[index].y;
        let y;
        if (!index) {
            y = 0;
        } else if (oldPointY) {
            if (newPointY >= oldPointY) {
                y = Math.round(100 * ((newPointY / oldPointY) - 1), 2);
            } else {
                y = Math.round(-100 * ((oldPointY / newPointY) - 1), 2);
            }
        } else if (newPointY) {
            // If we come from 0 and get to a value, the rate of change is
            // undefined.
            y = undefined;
        } else {
            // If we come from 0 and stay at 0, the rate of change is 0.
            y = 0;
        }
        return {
            x: points[index].x,
            y: y,
        };
    }
}
