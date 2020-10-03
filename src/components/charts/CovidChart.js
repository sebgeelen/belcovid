import React from 'react';
import { Chart } from 'react-charts';
import memoize from 'memoize-one';
import { getDaysBetween, getDateFrom } from '../../helpers';

export default class CovidChart extends React.Component {
    _isZoomingOut = false;
    render() {
        const data = memoize(() => this.props.data, [this.props.data]);
        const seriesObject = { showPoints: false };
        if (this.props.seriesType) {
            seriesObject.type = this.props.seriesType;
        }
        const series = memoize(
            () => seriesObject,
            [seriesObject]
        );
        const axes = this.props.axes ?
        memoize(() => this.props.axes, [this.props.axes]) :
        memoize(
            () => [
                {
                    primary: true,
                    type: 'utc',
                    position: 'bottom',
                    hardMin: null,
                    hardMax: null,
                },
                { type: this.props.secondaryAxisType, position: 'left', stacked: this.props.stacked || false }
            ],
            []
        );
        const brush = memoize(
            () => ({
                onSelect: brushData => {
                    if (isNaN(brushData.start.getTime()) || isNaN(brushData.end.getTime())) return;
                    let min = new Date(Math.min(brushData.start, brushData.end));
                    let max = new Date(Math.max(brushData.start, brushData.end));
                    const interval = getDaysBetween(min, max);
                    if (interval < 1) {
                        max = getDateFrom(min, 1);
                    }
                    if (this._isZoomingOut) {
                        this._isZoomingOut = false;
                        min = getDateFrom(this.props.min, -1 * Math.ceil(interval) * 2);
                        max = getDateFrom(this.props.max, Math.ceil(interval) * 2);
                    }
                    this.props.setDataRange(min, max);
                }
            }),
            []
        );
        const tooltip = this.props.tooltip ?
            memoize(() => this.props.tooltip, [this.props.tooltip]) :
            memoize(() => ({ anchor: 'gridBottom' }), []);

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
                    onMouseDown={this._onMouseDown.bind(this)}
                    onMouseUp={this._onMouseUp.bind(this)}
                    primaryCursor secondaryCursor
                />
            </div>
        );
    }
    _onMouseDown(e) {
        if (e.ctrlKey || e.metaKey) {
            e.currentTarget.classList.add('zoom-out');
        } else {
            e.currentTarget.classList.add('zoom-in');
        }
    }
    _onMouseUp(e) {
        if (e.ctrlKey || e.metaKey) {
            e.currentTarget.classList.remove('zoom-out');
            this._isZoomingOut = true;
        } else {
            e.currentTarget.classList.remove('zoom-in');
        }
    }
}
