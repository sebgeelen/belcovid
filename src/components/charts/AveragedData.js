import React from 'react';
import { getAveragePoints, getDateFrom, getPolynomialRegressionPoints, lastConsolidatedDataDay } from '../../helpers';
import LineChart from './LineChart';

const regressionStart = getDateFrom(lastConsolidatedDataDay(), -28);
export default function AveragedData({
    asImage,
    chartName,
    data,
    labelStrings,
    noAverage,
    max,
}) {
    const points = [];
    let start;
    let end;
    for (const date of Object.keys(data)) {
        const dateObject = new Date(date);
        // Ignore the data if it concerns days beyond the limit set in
        // props.
        if (max && dateObject > max) {
            continue;
        }
        start = (dateObject >= start && start) || dateObject;
        end = (dateObject <= end && end) || dateObject;
        const items = data[date];
        points.push({
            x: dateObject,
            y: typeof items === 'object' ? items.total : items,
        });
    }
    const averagedPoints = noAverage ? [] : getAveragePoints(points, 7);
    const regressionPoints = getPolynomialRegressionPoints((noAverage ? points : averagedPoints).filter(p => {
        return p.x >= regressionStart;
    }), 3);
    const yValues = [...averagedPoints, ...regressionPoints, ...points].map(p => p.y).filter(a => a).sort((a, b) => a - b);
    const datasets = [
        {
            label: 'Trend line',
            data: regressionPoints,
            borderColor: '#fc6868',
            backgroundColor: '#fc6868',
            fill: false,
            radius: 0,
        },
        {
            label: `${chartName}`,
            data: points,
            borderColor: '#decf3f',
            backgroundColor: '#decf3f',
            fill: false,
            radius: 0,
        },
    ];
    !noAverage && datasets.unshift({
        label: `${chartName} (7-day average)`,
        data: averagedPoints,
        borderColor: '#4ab5eb',
        backgroundColor: '#4ab5eb',
        fill: false,
        radius: 0,
    });
    return <LineChart
        chartName={chartName}
        datasets={datasets}
        bounds={{
            x: {
                min: start,
                max: end,
            },
            y: {
                min: 0,
                // Round up to the nearest ten.
                max: Math.ceil((yValues[yValues.length - 1] + 10) / 10) * 10,
            },
        }}
        logarithmic={true}
        asImage={asImage}
        labelStrings={labelStrings}
    />;
}
