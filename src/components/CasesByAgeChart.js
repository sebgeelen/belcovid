import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';

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

export default class CasesByAgeChart extends React.Component {
    state = {};
    render() {
        let casesData = this.props.data?.cases || [];
        if (this.props.start) {
            casesData = casesData.filter(item => new Date(item.DATE) > this.props.start);
        }
        const dates = new Set(casesData?.map(item => item.DATE));

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
        const data = memoize(
            () => AGE_GROUPS.sort((a, b) => points[a].total - points[b].total).map(group => {
                return {
                    label: `New cases (${group})`,
                    data: points[group].values,
                };
            }), [{points}],
        );
        const series = memoize(
            () => ({
                type: 'area',
                showPoints: false,
            }),
            []
        );

        const axes = memoize(
            () => [
            { primary: true, type: 'utc', position: 'bottom' },
            { type: 'linear', position: 'left', stacked: true }
            ],
            []
        );

        return (
            // A react-chart hyper-responsively and continuously fills the available
            // space of its parent element automatically
            <div
                style={{
                    width: '90%',
                    height: '300px',
                }}
            >
                <Chart data={data()} series={series()} axes={axes()} tooltip primaryCursor secondaryCursor />
            </div>
        );
    }
}
