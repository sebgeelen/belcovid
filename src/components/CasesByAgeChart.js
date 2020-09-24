import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';
import { getDateFrom, getDaysBetween, getIsoDate } from '../helpers';

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
        min: new Date(getIsoDate(getDateFrom(new Date(), -1 - (START_WEEK * 7)))),
        max: new Date(getIsoDate(new Date())),
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
        const sortedPoints = AGE_GROUPS.sort((a, b) => points[a].total - points[b].total).map(group => {
            return {
                label: `${group}`,
                data: points[group].values,
            };
        });
        const data = memoize(() => sortedPoints, [sortedPoints]);
        const series = memoize(
            () => ({
                type: 'area',
                showPoints: false,
            }),
            []
        );
        const axes = memoize(
            () => [
            {
                primary: true,
                type: 'utc',
                position: 'bottom',
                hardMin: null,
                hardMax: null,
            },
            { type: 'linear', position: 'left', stacked: true }
            ],
            []
        );
        const brush = memoize(
            () => ({
                onSelect: brushData => {
                    if (isNaN(brushData.start.getTime()) || isNaN(brushData.end.getTime())) return;
                    let min = new Date(getIsoDate(new Date(Math.min(brushData.start, brushData.end))));
                    let max = new Date(getIsoDate(new Date(Math.max(brushData.start, brushData.end))));
                    const interval = getDaysBetween(min, max);
                    if (interval < 1) {
                        max = getDateFrom(min, 1);
                    }
                    if (this._isZoomingOut) {
                        this._isZoomingOut = false;
                        min = getDateFrom(this.state.min, -1 * Math.ceil(interval) * 2);
                        max = getDateFrom(this.state.max, Math.ceil(interval) * 2);
                    }
                    this.setState({ min, max });
                }
            }),
            []
        );
        const tooltip = memoize(() => ({
            render: ({ datum, primaryAxis, getStyle }) => {
                const localData = memoize(
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
                                data={localData()}
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
         }), []);

        return (
            // A react-chart hyper-responsively and continuously fills the available
            // space of its parent element automatically
            <div
                style={{
                    width: '90%',
                    height: '300px',
                }}
            >
                <Chart
                    data={data()}
                    series={series()}
                    axes={axes()}
                    brush={brush()}
                    tooltip={tooltip()}
                    onMouseDown={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                            e.currentTarget.classList.add('zoom-out');
                        } else {
                            e.currentTarget.classList.add('zoom-in');
                        }
                    }}
                    onMouseUp={(e) => {
                        if (e.ctrlKey || e.metaKey) {
                            e.currentTarget.classList.remove('zoom-out');
                            this._isZoomingOut = true;
                        } else {
                            e.currentTarget.classList.remove('zoom-in');
                        }
                    }}
                    primaryCursor secondaryCursor
                />
            </div>
        );
    }
}
