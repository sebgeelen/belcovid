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
export default function AreaTimeChart({
    annotations,
    asImage,
    bounds,
    chartName,
    classes,
    datasets,
    labelStrings,
    stacked,
    ticksCallbacks,
}) {
    return (
        <LineChart
            classes={classes}
            chartName={chartName}
            datasets={datasets.map((dataset, index) => {
                return {
                    ...dataset,
                    borderColor: colors[index],
                    radius: 0,
                    backgroundColor: colors[index],
                    fill: stacked,
                };
            })}
            stacked={typeof stacked === 'boolean' ? stacked : true}
            annotations={annotations}
            bounds={bounds}
            asImage={asImage}
            ticksCallbacks={ticksCallbacks}
            labelStrings={labelStrings}
            sort={true}
        />
    );
}
