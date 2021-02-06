import React from 'react';
import { getAveragePoints, objectFrom } from '../../helpers';
import 'chartjs-plugin-zoom';
import AreaTimeChart from './AreaTimeChart';

export default function ChartByAge({
    ageGroups,
    annotations,
    asImage,
    chartName,
    classes,
    data,
    labelStrings,
    stacked,
    ticksCallbacks,
    max,
}) {
    const points = objectFrom(ageGroups, []);

    let start;
    let end;
    for (const date of Object.keys(data)) {
        const dateObject = new Date(date);
        // Ignore the data if it concerns days beyond the limite set in
        // props.
        if (max && dateObject > max) {
            continue;
        }
        start = (dateObject >= start && start) || dateObject;
        end = (dateObject <= end && end) || dateObject;
        for (const group of ageGroups) {
            points[group].push({
                x: dateObject,
                y: data[date][group],
            });
        }
    }
    return <AreaTimeChart
        classes={classes}
        chartName={chartName}
        datasets={ageGroups.map(group => {
            return {
                label: `${group}`,
                data: getAveragePoints(points[group], 7),
            };
        })}
        bounds={{
            x: {
                min: start,
                max: end,
            },
            y: {
                min: 0,
            },
        }}
        annotations={annotations}
        asImage={asImage}
        stacked={stacked}
        ticksCallbacks={ticksCallbacks}
        labelStrings={labelStrings}
    />;
}
