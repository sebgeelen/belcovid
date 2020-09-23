import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';
import { ResizableArea } from 'react-resizable-area';
import { getAveragePoints, getPolynomialRegressionPoints } from '../helpers';

export default class CasesByTestChart extends React.Component {
    state = {};
    render() {
        let casesData = this.props.data?.cases || [];
        let testsData = this.props.data?.tests || [];
        if (this.props.start) {
            casesData = casesData.filter(item => new Date(item.DATE) > this.props.start);
            testsData = testsData.filter(item => new Date(item.DATE) > this.props.start);
        }
        const dates = new Set(casesData?.map(item => item.DATE));
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
            { primary: true, type: 'utc', position: 'bottom' },
            { type: 'linear', position: 'left' }
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
                <ResizableArea
                    initHeight={{px: 0, percent: 100}}
                    initWidth={{px: 0, percent: 100}}
                    parentContainer={document.querySelector('.resizable-container')}
                >
                    <Chart data={data()} series={series()} axes={axes()} tooltip primaryCursor secondaryCursor />
                </ResizableArea>
            </div>
        );
    }
}
