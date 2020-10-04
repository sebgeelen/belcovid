import React from 'react';
import { getAveragePoints, getPolynomialRegressionPoints, lastConsolidatedDataDay } from '../../helpers';
import CovidChart from './CovidChart';

export default class RateOfChangeChart extends React.Component {
    state = {
        min: new Date('2020-09-01'),
        max: lastConsolidatedDataDay(),
    };
    render() {
        let data = [...this.props.data] || [];
        if (this.state.min || this.state.max) {
            data = data.filter(item => {
                const date = new Date(item.DATE);
                return (!this.state.min || date >= this.state.min) &&
                    (!this.state.max || date <= this.state.max);
            });
        }
        const dates = new Set(data?.map(item => item.DATE).filter(item => item));
        const points = [];
        for (const date of dates) {
            const items = data.filter(item => item.DATE === date);
            const patients = items.reduce((a, b) => a + b[this.props.keyToPlot], 0) || 0;
            points.push({x: new Date(date), y: patients});
        }
        const rateOfChangePoints = getAveragePoints(points, 7).map((point, index) => {
            return index && this._getRateOfChangePoint(points, index, 2);
        }).filter(d => d && typeof d.y === 'number');
        const plotData = [
            {
                label: `Rate of change of ${this.props.chartName.toLowerCase()} (7-day rolling average)`,
                data: getAveragePoints([...rateOfChangePoints], 7),
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints([...rateOfChangePoints], 2),
            },
        ];

        return <CovidChart
            data={plotData}
            setDataRange={(min, max) => this.setState({ min, max })}
            secondaryAxisType="linear"
            min={this.state.min}
            max={this.state.max}
        />;
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
            y = 100 * ((newPointY / oldPointY) - 1);
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
