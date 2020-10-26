import React from 'react';
import { Chart, Line } from 'react-chartjs-2';
import { betterRound, isMobile, lastConsolidatedDataDay, today } from '../../helpers';
import 'chartjs-plugin-annotation';
import { AppBar, CardMedia, Dialog, IconButton, Slide, Toolbar, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

Chart.Tooltip.positioners.custom = (elements, position) => {
    if (!elements.length) {
        return false;
    }

    // Adjust the offset left or right depending on the event position.
    let offsetX = 0;
    if (elements[0]._chart.width / 2 > position.x) {
        offsetX = 100;
    } else {
        offsetX = -100;
    }

    let offsetY = 0;
    if (elements[0]._chart.height / 2 > position.y) {
        offsetY = 100;
    } else {
        offsetY = -100;
    }
    return {
        x: position.x + offsetX,
        y: position.y + offsetY,
    };
};

const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

export default class LineChart extends React.Component {
    state = {
        chartImageURI: null,
        fullscreen: false,
        asImage: this.props.asImage || false,
    };
    classes = this.props.classes
    options = this._defaultOptions();
    chartReference = React.createRef();
    _lastDatasets = null;
    _recomputeImage = false;
    render() {
        let contents;
        if (!this._lastDatasets || this.props.datasets !== this._lastDatasets) {
            this._recomputeImage = true;
        }
        this._lastDatasets = this.props.datasets;
        this._adaptOptions();
        if (!this._recomputeImage && this.state.asImage && this.state.chartImageURI) {
            contents = <CardMedia
                component="img"
                alt={this.props.chartName}
                image={this.state.chartImageURI}
                title={this.props.chartName}
                onClick={this.state.fullscreen ?
                    () => true :
                    this.toggleFullscreen.bind(this)}
            />;
        } else {
            contents = (
                <Line
                    ref={this.chartReference}
                    data={{
                        datasets: this.props.datasets,
                    }}
                    options={this.options}
                />
            );
        }
        if (this.state.fullscreen) {
            return (
                <Dialog fullScreen open TransitionComponent={DialogTransition}>
                    <AppBar>
                        <Toolbar>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={this.toggleFullscreen.bind(this)}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography component="h1" variant="h6" color="inherit" noWrap className={this.classes?.title}>
                                {this.props.chartName}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <main className={this.classes?.content}>
                        <div className={this.classes?.appBarSpacer} />
                        <div style={{height: '90vh', padding: 5, minWidth: 200, minHeight: 200}}>
                            {contents}
                        </div>
                    </main>
                </Dialog>
            );
        } else {
            return <div style={{minWidth: 200, minHeight: 200, height: '100%'}}>{contents}</div>;
        }
    }
    toggleFullscreen() {
        const fullscreen = !this.state.fullscreen;
        this.setState({
            asImage: fullscreen ? false : this.props.asImage,
            fullscreen: fullscreen,
        });
    }
    _defaultOptions() {
        return {
            legend: {
                display: true,
            },
            tooltips: {
                enabled: true,
                mode: 'index',
                intersect: false,
                position: 'custom',
                xPadding: 10,
                yPadding: 10,
                titleAlign: 'center',
                titleMarginBottom: 10,
                bodySpacing: 5,
                footerAlign: 'center',
                footerMarginTop: 10,
                callbacks: {
                    label: (item, data) => {
                        const dataset = data.datasets[item.datasetIndex];
                        return `${dataset.label}: ${betterRound(item.yLabel)}`;
                    },
                },
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM D YYYY'
                    },
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 10,
                        source: 'auto',
                        min: new Date('2020-08-30'),
                        max: lastConsolidatedDataDay(),
                    },
                }],
                yAxes: [{
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 10,
                        source: 'auto',
                    },
                }],
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                onComplete: () => {
                    if (this.state.asImage) {
                        // Only recompute the image if that was specifically
                        // requested or we haven't computed it yet.
                        if (this._recomputeImage || !this.state.chartImageURI) {
                            const chartImageURI = this.chartReference.current.chartInstance.toBase64Image();
                            this._recomputeImage = false;
                            this.setState({ chartImageURI });
                        } else {
                            this._recomputeImage = false;
                            this.setState({ asImage: this.state.asImage });
                        }
                    }
                },
            },
            // Plugins
            zoom: {
                enabled: true,
                mode: 'x',
                rangeMin: {
                    x: null,
                },
                rangeMax: {
                    x: today(),
                },
            },
            pan: {
                enabled: true,
                mode: 'x',
                rangeMin: {
                    x: null,
                },
                rangeMax: {
                    x: null,
                },
            },
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x-axis-0',
                        value: new Date('2020-04-10'),
                        borderColor: 'red',
                        borderDash: [10, 10],
                        borderWidth: 1,
                        label: {
                            content: 'Peak 1',
                            enabled: true,
                            fontSize: 10,
                            fontStyle: 'normal',
                            position: 'top',
                        },
                    },
                    {
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x-axis-0',
                        value: new Date('2020-09-01'),
                        borderColor: 'red',
                        borderDash: [10, 10],
                        borderWidth: 1,
                        label: {
                            content: 'Schools open',
                            enabled: true,
                            fontSize: 10,
                            fontStyle: 'normal',
                            position: 'top',
                        },
                    },
                ]
            },
        };
    }
    _adaptOptions() {
        if (this.props.stacked) {
            this.options.scales.yAxes[0].stacked = true;
            this.options.tooltips.callbacks.footer = items => {
                const total = items.reduce((sum, item) => {
                    return sum + item.yLabel;
                }, 0);
                return `Total: ${betterRound(total)}`;
            };
        } else {
            this.options.scales.yAxes[0].stacked = false;
        }
        if (this.props.bounds) {
            if (this.props.bounds.x?.min !== undefined) {
                this.options.zoom.rangeMin.x = this.props.bounds.x.min;
            }
            if (this.props.bounds.x?.max !== undefined) {
                this.options.scales.xAxes[0].ticks.max = this.props.bounds.x.max;
                this.options.zoom.rangeMax.x = this.props.bounds.x.max;
            }
            if (this.props.bounds.y?.min !== undefined) {
                this.options.scales.yAxes[0].ticks.min = this.props.bounds.y.min;
            }
            if (this.props.bounds.y?.max !== undefined) {
                this.options.scales.yAxes[0].ticks.max = this.props.bounds.y.max;
            }
        }
        if (this.props.logarithmic) {
            this.options.scales.yAxes[0].type = 'logarithmic';
        }
        if (this.props.yAxes) {
            this.options.scales.yAxes = this.props.yAxes;
        }
        if (this.props.annotations) {
            this.options.annotation.annotations = [...this.options.annotation.annotations, ...this.props.annotations];
        }
        if (this.props.tooltip === false) {
            this.options.tooltips.enabled = false;
        }
        // Ensure logarithmic type y axes have proper labels.
        for (let i = 0; i < this.options.scales.yAxes.length; i++) {
            const yAxis = this.options.scales.yAxes[i];
            if (yAxis.type === 'logarithmic') {
                if (!this.options.scales.yAxes[i].ticks) {
                    this.options.scales.yAxes[i].ticks = {};
                }
                // Pass tick values as a string into Number contructor to format
                // them.
                this.options.scales.yAxes[i].ticks.callback = value => '' + Number(value.toString());
            }
        }
        if (this.state.fullscreen) {
            this.options.legend.display = true;
        } else {
            this.options.legend.display = !isMobile(false);
        }
        if (this.props.ticksCallbacks) {
            if (this.props.ticksCallbacks.x) {
                this.options.scales.xAxes[0].ticks.callback = this.props.ticksCallbacks.x;
            }
            if (this.props.ticksCallbacks.y) {
                this.options.scales.yAxes[0].ticks.callback = this.props.ticksCallbacks.y;
            }
        }
        if (this.props.labelStrings) {
            if (this.props.labelStrings.x) {
                const current = this.options.scales.xAxes[0].scaleLabel || {};
                this.options.scales.xAxes[0].scaleLabel = {
                    ...current,
                    labelString: this.props.labelStrings.x,
                    display: true,
                    fontSize: 10,
                    lineHeight: .5,
                };
            }
            if (this.props.labelStrings.y) {
                const current = this.options.scales.yAxes[0].scaleLabel || {};
                this.options.scales.yAxes[0].scaleLabel = {
                    ...current,
                    labelString: this.props.labelStrings.y,
                    display: true,
                    fontSize: 10,
                    lineHeight: .5,
                };
            }
        }
    }
}
