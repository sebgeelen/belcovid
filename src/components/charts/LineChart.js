import React from 'react';
import { Line } from 'react-chartjs-2';
import { lastConsolidatedDataDay, today } from '../../helpers';

export default class LineChart extends React.Component {
    options = this._computeOptions();
    render() {
        return (
            <Line
                data={{
                    datasets: this.props.datasets,
                }}
                options={this.options}
            />
        );
    }
    _computeOptions() {
        const options = {
            tooltips: {
                mode: 'index',
                intersect: false,
                position: 'average',
                xPadding: 10,
                yPadding: 10,
                titleAlign: 'center',
                titleMarginBottom: 10,
                bodySpacing: 5,
                footerAlign: 'center',
                footerMarginTop: 10,
                callbacks: {},
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM D YYYY'
                    },
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 10,
                        source: 'auto',
                        min: new Date('2020-09-01'),
                        max: lastConsolidatedDataDay(),
                    },
                }],
                yAxes: [{
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 10,
                        source: 'auto',
                    },
                }],
            },
            maintainAspectRatio: false,
            zoom: {
                enabled: true,
                mode: 'x',
                rangeMin: {
                    x: null,
                },
                rangeMax: {
                    x: today(),
                },
            },
            pan: {
                enabled: true,
                mode: 'x',
                rangeMin: {
                    x: null,
                },
                rangeMax: {
                    x: null,
                },
            },
        }; ;
        if (this.props.stacked) {
            options.scales.yAxes[0].stacked = true;
            options.tooltips.callbacks = {
                footer: items => {
                    const total = items.reduce((sum, item) => {
                        return sum + item.yLabel;
                    }, 0);
                    return `Total: ${total}`;
                },
            };
        }
        if (this.props.bounds) {
            if (this.props.bounds.x?.min !== undefined) {
                options.zoom.rangeMin.x = this.props.bounds.x.min;
            }
            if (this.props.bounds.x?.max !== undefined) {
                options.scales.xAxes[0].ticks.max = this.props.bounds.x.max;
                options.zoom.rangeMax.x = this.props.bounds.x.max;
            }
            if (this.props.bounds.y?.min !== undefined) {
                options.scales.yAxes[0].ticks.min = this.props.bounds.y.min;
            }
            if (this.props.bounds.y?.max !== undefined) {
                options.scales.yAxes[0].ticks.max = this.props.bounds.y.max;
            }
        }
        if (this.props.logarithmic) {
            options.scales.yAxes[0].type = 'logarithmic';
            // Pass tick values as a string into Number contructor to format them.
            options.scales.yAxes[0].ticks.callback = value => '' + Number(value.toString());
        }
        return options;
    }
}
