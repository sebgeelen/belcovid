import React, { useEffect, useMemo, useState } from 'react';
import { Chart, Line } from 'react-chartjs-2';
import { betterRound, getDateFrom, isMobile, lastConsolidatedDataDay, today } from '../../helpers';
import 'chartjs-plugin-annotation';
import { AppBar, CardMedia, Dialog, IconButton, Slide, Toolbar, Typography, withStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { styles } from '../../styles';

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

const defaultBaseOptions = () => {
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
                    min: getDateFrom(lastConsolidatedDataDay(), -28),
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
                    value: new Date('2020-03-13'),
                    borderColor: 'red',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Start "lockdown"',
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
                    value: new Date('2020-05-11'),
                    borderColor: 'grey',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Shops open',
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
                    value: new Date('2020-05-18'),
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
                {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: new Date('2020-06-08'),
                    borderColor: 'grey',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Horeca opens',
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
                    value: new Date('2020-07-01'),
                    borderColor: 'red',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'School vacation',
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
                    value: new Date('2020-07-25'),
                    borderColor: 'grey',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Mandatory masks indoors',
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
                {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: new Date('2020-09-24'),
                    borderColor: 'red',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Mesures relaxed',
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
                    value: new Date('2020-11-02'),
                    borderColor: 'red',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Start "lockdown"',
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
                    value: new Date('2020-12-28'),
                    borderColor: 'red',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'First vaccine',
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
                    value: new Date('2021-12-27'),
                    borderColor: 'grey',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Omicron variant is predominant',
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
                    value: new Date('2021-12-27'),
                    borderColor: 'grey',
                    borderDash: [10, 10],
                    borderWidth: 1,
                    label: {
                        content: 'Omicron variant is predominant',
                        enabled: true,
                        fontSize: 10,
                        fontStyle: 'normal',
                        position: 'top',
                    },
                },
            ]
        },
    }
};

// In order to render as an image, the chart rendering needs to complete first.
// When then props change, in order to render as an image, we need to rerender
// as a chart and then again as an image. For that purpose, we need this
// variable to be global. It is set to false when rendering as a chart, and to
// true when react-chartjs-2 triggers an event to notify that the rendering of
// the chart is complete.
let readyToRenderAsImage = false;
function LineChart({
    annotations,
    bounds,
    chartName,
    classes,
    datasets,
    asImage,
    labelStrings,
    logarithmic,
    stacked,
    ticksCallbacks,
    sort,
    tooltip,
    yAxes,
}) {
    const [chartImageURI, setChartImageURI] = useState(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [showAsImage, setShowAsImage] = useState(asImage || false);
    const chartReference = React.createRef();

    useEffect(() => {
        if (fullscreen) {
            document.addEventListener('keydown', ev => {
                if (ev.key === 'Escape') {
                    readyToRenderAsImage = false;
                    setShowAsImage(asImage);
                    setFullscreen(false);
                }
            });
        }
    }, [asImage, fullscreen]);

    const options = useMemo(() => {
        const options = defaultBaseOptions();
        options.animation = {
            onComplete: () => {
                if (showAsImage) {
                    readyToRenderAsImage = true;
                    setChartImageURI(chartReference.current.chartInstance.toBase64Image());
                }
            },
        };
        if (stacked) {
            options.scales.yAxes[0].stacked = true;
            options.tooltips.callbacks.footer = items => {
                const total = items.reduce((sum, item) => {
                    return sum + item.yLabel;
                }, 0);
                return `Total: ${betterRound(total)}`;
            };
        } else {
            options.scales.yAxes[0].stacked = false;
            options.tooltips.callbacks.footer = items => '';
        }
        if (bounds) {
            bounds.x?.min !== undefined && (options.zoom.rangeMin.x = bounds.x.min);
            if (bounds.x?.max !== undefined) {
                options.scales.xAxes[0].ticks.max = bounds.x.max;
                options.zoom.rangeMax.x = bounds.x.max;
            }
            bounds.y?.min !== undefined && (options.scales.yAxes[0].ticks.min = bounds.y.min);
            bounds.y?.max !== undefined && (options.scales.yAxes[0].ticks.max = bounds.y.max);
        }
        logarithmic && (options.scales.yAxes[0].type = 'logarithmic');
        yAxes && (options.scales.yAxes = yAxes);
        annotations &&
            (options.annotation.annotations = [...options.annotation.annotations, ...annotations]);
        tooltip === false && (options.tooltips.enabled = false);
        sort && (options.tooltips.itemSort = (a, b, data) => {
            const dataset = data.datasets[a.datasetIndex];
            if (dataset.label.toLowerCase() === 'total') {
                return -1;
            }
            return b.yLabel - a.yLabel;
        });
        // Ensure logarithmic type y axes have proper labels.
        for (let i = 0; i < options.scales.yAxes.length; i++) {
            const yAxis = options.scales.yAxes[i];
            if (yAxis.type === 'logarithmic') {
                if (!options.scales.yAxes[i].ticks) {
                    options.scales.yAxes[i].ticks = {};
                }
                // Pass tick values as a string into Number contructor to format
                // them.
                options.scales.yAxes[i].ticks.callback = value => '' + Number(value.toString());
            }
        }
        options.legend.display = fullscreen ? true : !isMobile(false);
        if (ticksCallbacks) {
            ticksCallbacks.x && (options.scales.xAxes[0].ticks.callback = ticksCallbacks.x);
            ticksCallbacks.y && (options.scales.yAxes[0].ticks.callback = ticksCallbacks.y);
        }
        if (labelStrings) {
            if (labelStrings.x) {
                const current = options.scales.xAxes[0].scaleLabel || {};
                options.scales.xAxes[0].scaleLabel = {
                    ...current,
                    labelString: labelStrings.x,
                    display: true,
                    fontSize: 10,
                    lineHeight: .5,
                };
            }
            if (labelStrings.y) {
                const current = options.scales.yAxes[0].scaleLabel || {};
                options.scales.yAxes[0].scaleLabel = {
                    ...current,
                    labelString: labelStrings.y,
                    display: true,
                    fontSize: 10,
                    lineHeight: .5,
                };
            }
        }
        return options;
    }, [annotations, bounds, chartReference, fullscreen, labelStrings, logarithmic, showAsImage, sort, stacked, ticksCallbacks, tooltip, yAxes]);

    const toggleFullscreen = () => {
        setShowAsImage(fullscreen ? asImage : false);
        setFullscreen(!fullscreen);
    };
    let contents;
    if (readyToRenderAsImage && showAsImage && chartImageURI) {
        contents = <CardMedia
            component="img"
            alt={chartName}
            image={chartImageURI}
            title={chartName}
            onClick={toggleFullscreen}
        />;
        readyToRenderAsImage = false;
    } else {
        contents = (
            <Line
                ref={chartReference}
                data={{ datasets }}
                options={options}
            />
        );
    }
    if (fullscreen) {
        return (
            <Dialog fullScreen open TransitionComponent={DialogTransition}>
                <AppBar>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={toggleFullscreen}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes?.title}>
                            {chartName}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <main className={classes?.content}>
                    <div className={classes?.appBarSpacer} />
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

export default withStyles(styles)(LineChart);
