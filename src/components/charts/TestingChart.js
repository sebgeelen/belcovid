import memoize from 'memoize-one';
import React from 'react';
import { Chart } from 'react-charts';
import { getAveragePoints, getDateBrush, getDateFrom, getIsoDate, getPolynomialRegressionPoints, lastConsolidatedDataDay } from '../../helpers';

const START_WEEK = 3;
export default class TestingChart extends React.Component {
    state = {
        min: new Date(getIsoDate(getDateFrom(lastConsolidatedDataDay(), -1 - (START_WEEK * 7)))),
        max: new Date(getIsoDate(lastConsolidatedDataDay())),
    };
    _isZoomingOut = false;
    render() {
        let comparativeData = this.props.comparativeData;
        let testData = this.props.testData;
        if (this.state.min || this.state.max) {
            comparativeData = this._filterForRange(this.props.comparativeData);
            testData = this._filterForRange(this.props.testData);
        }
        const dates = this._getDates(comparativeData);
        const points = [];
        const rawComparativePoints = [];
        const rawTestPoints = [];
        let itemsYesterday = [];
        for (const date of dates) {
            const comparisons = comparativeData.filter(item => item.DATE === date);
            const tests = testData.filter(item => item.DATE === date);
            const totalTests = tests.reduce((a, b) => a + b.TESTS_ALL, 0);
            const testsYesterday = itemsYesterday.reduce((a, b) => a + b.TESTS_ALL, 0) || 0;
            const testsToday = totalTests - testsYesterday;
            if (testsToday) {
                const comparisonsToday = comparisons.reduce((a, b) => a + b[this.props.keyToCompare], 0) || 0;
                const formattedDate = new Date(date);
                rawTestPoints.push({ x: formattedDate, y: testsToday });
                rawComparativePoints.push({ x: formattedDate, y: comparisonsToday });
                points.push({ x: formattedDate, y: 100 * comparisonsToday / testsToday });
            }
            itemsYesterday = [...comparisons];
        }
        const data = memoize(
            () => [
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} / test (7d rolling average)`,
                data: getAveragePoints(points, 7),
                secondaryAxisID: 'rates',
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points),
                secondaryAxisID: 'rates',
            },
            {
                label: `% ${this.props.keyToCompare.toLowerCase()} tests`,
                data: points,
                secondaryAxisID: 'rates',
            },
            {
                label: `${this.props.keyToCompare.toLowerCase()}`,
                data: rawComparativePoints,
                secondaryAxisID: 'raw',
            },
            {
                label: 'Tests',
                data: rawTestPoints,
                secondaryAxisID: 'raw',
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
            { type: 'linear', position: 'left', id: 'rates' },
            { type: 'log', position: 'right', id: 'raw' },
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

    _filterForRange(data) {
        return data.filter(item => {
            const date = new Date(item.DATE);
            return (!this.state.min || date >= this.state.min) &&
                (!this.state.max || date <= this.state.max);
        });
    }
    _getDates(data) {
        return new Set(data.map(item => item.DATE).filter(item => item));
    }
}
