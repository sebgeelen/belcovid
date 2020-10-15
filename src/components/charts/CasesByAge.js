import React from 'react';
import { getAveragePoints } from '../../helpers';
import 'chartjs-plugin-zoom';
import StackedAreaTimeChart from './StackedAreaTimeChart';
import { AGE_GROUPS } from '../../data';

export default class CasesByAge extends React.Component {
    _isZoomingOut = false;
    render() {
        let casesData = this.props.data?.cases || [];
        const dates = new Set(casesData?.map(item => item.DATE).filter(item => item));
        const points = {};
        AGE_GROUPS.reduce((points, group) => {
            points[group] = [];
            return points;
        }, points);

        let start;
        let end;
        for (const date of dates) {
            if (!start || new Date(date) < start) start = new Date(date);
            if (!end || new Date(date) > end) end = new Date(date);
            const items = casesData.filter(item => item.DATE === date);
            for (const group of AGE_GROUPS) {
                let groupItems;
                if (group === 'Age unknown') {
                    groupItems = items.filter(item => !item.AGEGROUP);
                } else {
                    groupItems = items.filter(item => item.AGEGROUP === group);
                }
                const groupCases = groupItems.reduce((a, b) => a + b.CASES, 0) || 0;
                points[group].push({
                    x: new Date(date),
                    y: groupCases,
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
