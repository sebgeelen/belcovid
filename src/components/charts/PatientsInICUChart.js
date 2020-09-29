import React from 'react';
import memoize from 'memoize-one';
import { Chart } from 'react-charts';
import { getAveragePoints, getDateBrush, getDateFrom, getIsoDate, getPolynomialRegressionPoints } from '../../helpers';

const START_WEEK = 3;
export default class PatientsInICUChart extends React.Component {
    state = {
        min: new Date(getIsoDate(getDateFrom(new Date(), -1 - (START_WEEK * 7)))),
        max: new Date(getIsoDate(new Date())),
    };
    _isZoomingOut = false;
    render() {
        let hospiData = this.props.data?.hospitalisations || [];
        if (this.state.min || this.state.max) {
            hospiData = hospiData.filter(item => {
                const date = new Date(item.DATE);
                return (!this.state.min || date >= this.state.min) &&
                    (!this.state.max || date <= this.state.max);
            });
        }
        const dates = new Set(hospiData?.map(item => item.DATE).filter(item => item));
        const points = [];
        for (const date of dates) {
            const items = hospiData.filter(item => item.DATE === date);
            const patients = items.reduce((a, b) => a + b.TOTAL_IN_ICU, 0) || 0;
            points.push({x: new Date(date), y: patients});
        }
        const data = memoize(
            () => [
            {
                label: 'Number of patients in intensive care (weekly average)',
                data: getAveragePoints(points, 7),
            },
            {
                label: 'Trend line',
                data: getPolynomialRegressionPoints(points, 3),
            },
            {
                label: 'Number of patients in intensive care',
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
                    primaryCursor secondaryCursor />
            </div>
        );
    }
}
