import React from 'react';
import { Line } from 'react-chartjs-2';

// Colors from https://coolors.co/493657-ce7da5-bee5bf-dff3e3-ffd1ba-ffb800-ff5714-279af1-247ba0-f2a359
const colors = [
    "#493657",
    "#ce7da5",
    "#bee5bf",
    "#dff3e3",
    "#ffd1ba",
    "#ffb800",
    "#ff5714",
    "#279af1",
    "#247ba0",
    "#f2a359"
];
export default class StackedAreaTimeChart extends React.Component {
    render() {
        const datasets = this.props.datasets.map((dataset, index) => {
            return {
                ...dataset,
                borderColor: colors[index],
                radius: 0,
                backgroundColor: colors[index],
                fill: true,
            };
        });
        return (
            <Line
                data={{
                    datasets: datasets,
                }}
                options={{
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                        position: 'average',
                    },
                    scales: {
                        yAxes: [{
                            stacked: true,
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                            },
                            ticks: {
                                autoSkip: true,
                                source: 'auto',
                                min: new Date('2020-09-01'),
                            },
                        }],
                    },
                    maintainAspectRatio: false,
                    zoom: {
                        enabled: true,
                        mode: 'x',
                        rangeMin: { x: this.props.start },
                        rangeMax: { x: this.props.end },
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                }}
            />
        );
    }
}
