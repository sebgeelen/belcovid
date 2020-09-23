import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';
import { ResizableArea } from 'react-resizable-area';
import { getAveragePoints, getPolynomialRegressionPoints } from '../helpers';

export default class PeopleInHospitalChart extends React.Component {
    state = {};
    render() {
        let hospiData = this.props.data?.hospi || [];
        if (this.props.start) {
            hospiData = hospiData.filter(item => new Date(item.DATE) > this.props.start);
        }
        const dates = new Set(hospiData?.map(item => item.DATE));
        const points = [];
        for (const date of dates) {
            const items = hospiData.filter(item => item.DATE === date);
            const patients = items.reduce((a, b) => a + b.TOTAL_IN, 0) || 0;
            points.push({x: new Date(date), y: patients});
        }
        const data = memoize(
            () => [
            {
                label: 'Number of patients in the hospital (weekly average)',
                data: getAveragePoints(points, 7),
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points, 3),
            },
            {
                label: 'Number of patients in the hospital',
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
