import React from 'react';
import { getAveragePoints } from '../../helpers';
import 'chartjs-plugin-zoom';
import AreaTimeChart from './AreaTimeChart';

export default class ChartByAge extends React.Component {
    render() {
        let casesData = this.props.data;
        const points = this.props.ageGroups.reduce((points, group) => {
            points[group] = [];
            return points;
        }, {});

        let start;
        let end;
        for (const date of Object.keys(casesData)) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > end) end = new Date(date);
            for (const group of this.props.ageGroups) {
                points[group].push({
                    x: new Date(date),
                    y: casesData[date][group],
                });
            }
        }
        const datasets = this.props.ageGroups.map(group => {
            return {
                label: `${group}`,
                data: getAveragePoints(points[group], 7),
            };
        });
        const bounds = {
            x: {
                min: start,
                max: end,
            },
            y: {
                min: 0,
            },
        };
        return <AreaTimeChart
            classes={this.props.classes}
            chartName={this.props.chartName}
            datasets={datasets}
            bounds={bounds}
            annotations={this.props.annotations}
            tooltip={this.props.tooltip}
            asImage={this.props.asImage}
            stacked={this.props.stacked}
            ticksCallbacks={this.props.ticksCallbacks}
            labelStrings={this.props.labelStrings}
        />;
    }
}
