import React from 'react';
import LineChart from './LineChart';

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
            <LineChart
                classes={this.props.classes}
                chartName={this.props.chartName}
                datasets={datasets}
                stacked={true}
                annotations={this.props.annotations}
                bounds={this.props.bounds}
                tooltip={this.props.tooltip}
                asImage={this.props.asImage}
            />
        );
    }
}
