import React from 'react';
import { Chart } from 'react-charts';

export default function BarChartTooltip({ getStyle, primaryAxis, datum }) {
    const data = React.useMemo(
        () =>
            datum ? [
                {
                    data: datum.group.map(d => ({
                        primary: d.series.label,
                        secondary: d.secondary,
                        color: getStyle(d).fill
                    }))
                }
            ] : [],
        [datum, getStyle]
    );
    return datum ? (
        <div
            style={{
                color: 'white',
                pointerEvents: 'none'
            }}
        >
            <h3
                style={{
                    display: 'block',
                    textAlign: 'center'
                    }}
            >
                {primaryAxis.format(datum.primary)}
            </h3>
            <div
                style={{
                    width: '300px',
                    height: '200px',
                    display: 'flex'
                }}
            >
                <Chart
                    data={data}
                    dark
                    series={{ type: 'bar' }}
                    axes={[
                        {
                            primary: true,
                            position: 'bottom',
                            type: 'ordinal'
                        },
                        {
                            position: 'left',
                            type: 'linear'
                        }
                    ]}
                    getDatumStyle={datum => ({
                        color: datum.originalDatum.color
                    })}
                    primaryCursor={{
                        value: datum.seriesLabel
                    }}
                />
            </div>
        </div>
    ) : null;
}
