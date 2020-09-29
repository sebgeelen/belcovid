import React from 'react';
import { Chart } from 'react-charts';
import memoize from 'memoize-one';
import { getDateBrush } from '../../helpers';

export default class CovidChart extends React.Component {
    _isZoomingOut = false;
    render() {
        const data = memoize(() => this.props.data, [this.props.data]);
        const seriesObject = { showPoints: false };
        if (this.props.seriesType) {
            seriesObject.type = this.props.seriesType;
        }
        const series = memoize(
            () => (seriesObject),
            [seriesObject]
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
            { type: this.props.secondaryAxisType, position: 'left', stacked: true }
            ],
            []
        );
        const brush = getDateBrush.bind(this)();

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
                    tooltip={this.props.tooltip || false}
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
