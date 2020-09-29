import React from 'react';
import memoize from 'memoize-one';
import BarChartTooltip from './BarChartTooltip.js';
import { getAveragePoints, getDateFrom, getIsoDate, today } from '../../helpers';
import CovidChart from './CovidChart.js';

const AGE_GROUPS = [
    '0-9',
    '10-19',
    '20-29',
    '30-39',
    '40-49',
    '50-59',
    '60-69',
    '70-79',
    '80-89',
    '90+',
    'Age unknown'
];

const START_WEEK = 3;
export default class CasesByAgeChart extends React.Component {
    state = {
        min: new Date(getIsoDate(getDateFrom(today(), -(START_WEEK * 7)))),
        max: new Date(getIsoDate(today())),
    };
    _isZoomingOut = false;
    render() {
        let casesData = this.props.data?.cases || [];
        if (this.state.min || this.state.max) {
            casesData = casesData.filter(item => {
                if (!item.DATE) return false;
                const date = new Date(item.DATE);
                return (!this.state.min || date >= this.state.min) &&
                    (!this.state.max || date <= this.state.max);
            });
        }
        const dates = new Set(casesData?.map(item => item.DATE).filter(item => item));

        const points = {};
        AGE_GROUPS.reduce((points, group) => {
            points[group] = { values: [], total: 0 };
            return points;
        }, points);

        for (const date of dates) {
            const items = casesData.filter(item => item.DATE === date);
            for (const group of AGE_GROUPS) {
                let groupItems;
                if (group === 'Age unknown') {
                    groupItems = items.filter(item => !item.AGEGROUP);
                } else {
                    groupItems = items.filter(item => item.AGEGROUP === group);
                }
                const groupCases = groupItems.reduce((a, b) => a + b.CASES, 0) || 0;
                points[group].values.push({x: new Date(date), y: groupCases});
            }
        }
        for (const group of AGE_GROUPS) {
            points[group].total = points[group].values.reduce((a, b) => a + b.y, 0);
        }
        const sortedAveragedPoints = AGE_GROUPS.sort((a, b) => points[a].total - points[b].total).map(group => {
            return {
                label: `${group}`,
                data: getAveragePoints(points[group].values, 7),
            };
        });
        const tooltip = memoize(() => ({
            render: ({ datum, primaryAxis, getStyle }) => {
                return <BarChartTooltip {...{ getStyle, primaryAxis, datum }} />;
            }
         }), []);

        return <CovidChart
            data={sortedAveragedPoints}
            setDataRange={(min, max) => this.setState({ min, max })}
            seriesType="area"
            secondaryAxisType="linear"
            min={this.state.min}
            max={this.state.max}
            tooltip={tooltip()}
        />;
    }
}
