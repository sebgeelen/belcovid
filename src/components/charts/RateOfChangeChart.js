import React from 'react';
import { getAveragePoints, getDateFrom, getIsoDate, getPolynomialRegressionPoints } from '../../helpers';
import CovidChart from './CovidChart';

export default class RateOfChangeChart extends React.Component {
    state = {
        min: new Date(getIsoDate(getDateFrom(new Date(), -1 - (this.props.startWeek * 7)))),
        max: new Date(getIsoDate(new Date())),
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
        const rateOfChangePoints = [...points].map((point, index) => {
            return {
                x: point.x,
                y: index === 0 ? 0 : (point.y - points[index - 1].y) / 2,
            };
        });
        const plotData = [
            {
                label: `Rate of change of ${this.props.chartName.toLowerCase()} (weekly average)`,
                data: getAveragePoints([...rateOfChangePoints], 7),
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints([...rateOfChangePoints], 3),
            },
            {
                label: `Rate of change of ${this.props.chartName.toLowerCase()}`,
                data: [...rateOfChangePoints],
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
}
