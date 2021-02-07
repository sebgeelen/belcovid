import React from 'react';
import { getWeeklyData } from '../../data/data';
import {
    getChangeRatio,
    getDateFrom,
    getPolynomialRegressionPoints,
    lastConsolidatedDataDay,
} from '../../helpers';
import LineChart from './LineChart';

const regressionStart = getDateFrom(lastConsolidatedDataDay(), -28);
export default function RateOfChange({
    annotations,
    asImage,
    chartName,
    data,
    max,
}) {
    const weeklyData = getWeeklyData(data);
    const weeklyPoints = [];
    let start;
    let end;
    for (const date of Object.keys(weeklyData)) {
        const dateObject = new Date(date);
        // Ignore the data if it concerns days beyond the limit set in
        // props.
        if (max && dateObject > max) {
            continue;
        }
        start = (dateObject >= start && start) || dateObject;
        end = (dateObject <= end && end) || dateObject;
        const value = weeklyData[date];
        weeklyPoints.push({
            x: dateObject,
            y: typeof value === 'object' ? value.total : value,
        });
    }
    const rateOfChangePoints = weeklyPoints.map((point, index) => {
        let y;
        if (index >= 6 && weeklyPoints[index - 6]) {
            y = getChangeRatio(point.y, weeklyPoints[index - 6].y);
        }
        if (y !== undefined) {
            return {
                x: point.x,
                y,
            };
        } else {
            return undefined;
        }
    }).filter(d => d && typeof d.y === 'number');

    return <LineChart
        chartName={chartName}
        datasets={[
            {
                label: chartName,
                data: rateOfChangePoints,
                borderColor: '#4ab5eb',
                backgroundColor: '#4ab5eb',
                fill: false,
                radius: 0,
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(rateOfChangePoints.filter(d => d.x >= regressionStart), 2),
                borderColor: '#fc6868',
                backgroundColor: '#fc6868',
                fill: false,
                radius: 0,
            },
        ]}
        bounds={{
            x: {
                min: start,
                max: end,
            },
        }}
        annotations={[...(annotations || []), ...[{
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y-axis-0',
            value: '0',
            borderColor: 'black',
            borderDash: [2, 2],
            borderWidth: 2,
        }]]}
        asImage={asImage}
        labelStrings={{y: '% / week'}}
    />;
}
