import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';
import { getAveragePoints, getDateBrush, getDateFrom, getIsoDate, getPolynomialRegressionPoints } from '../helpers';

const START_WEEK = 12;
export default class CasesByTestChart extends React.Component {
    state = {
        min: new Date(getIsoDate(getDateFrom(new Date(), -1 - (START_WEEK * 7)))),
        max: new Date(getIsoDate(new Date())),
    };
    _isZoomingOut = false;
    render() {
        let casesData = this.props.data?.cases || [];
        let testsData = this.props.data?.tests || [];
        if (this.state.min || this.state.max) {
            casesData = casesData.filter(item => {
                const date = new Date(item.DATE);
                return (!this.state.min || date >= this.state.min) &&
                    (!this.state.max || date <= this.state.max);
            });
            testsData = testsData.filter(item => {
                const date = new Date(item.DATE);
                return (!this.state.min || date >= this.state.min) &&
                    (!this.state.max || date <= this.state.max);
            });
        }
        const dates = new Set(casesData?.map(item => item.DATE).filter(item => item));
        const points = [];
        let itemsYesterday = [];
        for (const date of dates) {
            const cases = casesData.filter(item => item.DATE === date);
            const tests = testsData.filter(item => item.DATE === date);
            const totalTests = tests.reduce((a, b) => a + b.TESTS_ALL, 0);
            const testsYesterday = itemsYesterday.reduce((a, b) => a + b.TESTS_ALL, 0) || 0;
            const testsToday = totalTests - testsYesterday;
            if (testsToday) {
                const casesToday = cases.reduce((a, b) => a + b.CASES, 0) || 0;
                points.push({x: new Date(date), y: 100 * casesToday / testsToday});
            }
            itemsYesterday = [...cases];
        }
        const data = memoize(
            () => [
            {
                label: '% positive tests (weekly average)',
                data: getAveragePoints(points, 7),
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points),
            },
            {
                label: '% positive tests',
                data: points,
            },
            ], [points]
        );
        const series = memoize(
            () => ({
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
            { type: 'linear', position: 'left' }
            ],
            []
        );
        const brush = getDateBrush.bind(this)();
        const tooltip = memoize(() => ({ anchor: 'gridBottom' }), []);

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
