import React from 'react';
import { getAveragePoints } from '../../helpers';
import 'chartjs-plugin-zoom';
import StackedAreaTimeChart from './StackedAreaTimeChart';
import { AGE_GROUPS } from '../../data';

export default class CasesByAge extends React.Component {
    render() {
        let casesData = this.props.data;
        const points = AGE_GROUPS.reduce((points, group) => {
            points[group] = [];
            return points;
        }, {});

        let start;
        let end;
        for (const date of Object.keys(casesData)) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > end) end = new Date(date);
            for (const group of AGE_GROUPS) {
                points[group].push({
                    x: new Date(date),
                    y: casesData[date][group],
                });
            }
        }
        const datasets = AGE_GROUPS.map(group => {
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
        return <StackedAreaTimeChart
            classes={this.props.classes}
            chartName={this.props.chartName}
            datasets={datasets}
            bounds={bounds}
            tooltip={this.props.tooltip}
            asImage={this.props.asImage}
        />;
    }
}
