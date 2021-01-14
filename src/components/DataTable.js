import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints, getDaysBetween, yesterday, today, normalizeDate, getChangeRatio, betterRound, getIsoDate } from '../helpers';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link, TableHead } from '@material-ui/core';
import { InfoBox } from './InfoBox';
import { getIncidenceData, provinceString } from '../data';
import { MathComponent } from 'mathjax-react';
import { populationData } from '../populationData';

const dayofMath = (
    <small>
        Solving the compound interest formula for t:
        <MathComponent tex={
            String.raw`A = P(1 + \frac{r}{n})^{nt} \quad \Leftrightarrow \quad t = \frac{\ln(\frac{A}{P})}{n\ln(1+\frac{r}{n})}`
        } />
    </small>
);
function saturationPopover(icu = false) {
    let source;
    if (icu) {
        source = (<small><i>
            Source on the number of beds in ICU:&nbsp;
            <Link href={'https://www.vrt.be/vrtnws/en/2020/03/22/health-' +
                'minister-says-that-an-additional-759-intensive-care-beds/'
            }>
                VRT,&nbsp;2020.
            </Link>
        </i></small>);
    } else {
        source = (<small><i>
            Sources on the number of hospital beds and the average number of
            hospitalized patients per day:&nbsp;
            <Link href={'https://kce.fgov.be/sites/default/files/atoms/files/' +
                'T%C3%A9l%C3%A9charger%20la%20synth%C3%A8se%20en%20' +
                'fran%C3%A7ais%20%2884%20p.%29.pdf'}
                target="_blank"
            >
                KCE,&nbsp;2014
            </Link>
                &nbsp;and&nbsp;
            <Link href={'https://www.healthybelgium.be/en/key-data-in-' +
                'healthcare/general-hospitals/organisation-of-the-hospital' +
                '-landscape/categorisation-of-hospital-activities/evolution' +
                '-of-the-number-of-accredited-hospital-beds'}
                target="_blank"
            >
                healthybelgium.be
            </Link>.
        </i></small>);
    }
    return (
        <InfoBox>
            The day that all available {icu ? 'ICU' : 'hospital'} beds (
            estimated to be {icu ? TOTAL_ICU_BEDS : AVAILABLE_BEDS}) would be in
            use if the 7-day rolling average total number of COVID-19 patients
            in {icu ? 'ICU' : 'hospitals'} were to keep growing at the same
            pace.<br/>
            <br/>
            {dayofMath}
            {source}
        </InfoBox>
    );
}
function peakPopover(variable, peak) {
    return (
        <InfoBox>
            The day that the {variable} would be the same
            as on the highest day recorded
            ({peak.date.toDateString()}:&nbsp;{Math.round(peak.total)}), based on
            7-day rolling average to account for statistical noise.<br/>
            <br/>
            {dayofMath}
        </InfoBox>
    );
}

export default class DataTable extends React.Component {
    peakHospitalizations = null;
    peakICU = null;
    render() {
        if (this.props.cases) {
            this.incidence = getIncidenceData(this.props.cases[this.props.province], this.props.province);
        }
        if (this.props.cases && !this.peakCases) {
            this.peakCases = this._getPeak(this.props.cases[this.props.province]);
        }
        if (this.incidence && !this.peakIncidence) {
            this.peakIncidence = this._getPeak(this.incidence);
        }
        if (this.props.totalHospitalizations && !this.peakHospitalizations) {
            this.peakHospitalizations = this._getPeak(this.props.totalHospitalizations[this.props.province]);
        }
        if (this.props.totalICU && !this.peakICU) {
            this.peakICU = this._getPeak(this.props.totalICU[this.props.province]);
        }
        if (this.props.mortality && !this.peakMortality) {
            this.peakMortality = this._getPeak(this.props.mortality.be); // Mortality data exists only for Belgium.
        }
        return (
            <React.Fragment>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell/>
                            <TableCell>Cases</TableCell>
                            <TableCell>Incidence (14d)</TableCell>
                            <TableCell>Total in Hospital</TableCell>
                            <TableCell>Total in ICU</TableCell>
                            <TableCell>Mortality</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Average */}
                        <TableRow>
                            <TableCell variant="head">
                                7-day rolling average
                                &nbsp;<InfoBox>
                                    Until {lastConsolidatedDataDay().toDateString()}.
                                    The data after that date is not yet
                                    consolidated.<br/>
                                    Change is shown over a period of 7 days.
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.cases &&
                                    Math.round(getAverageOver(
                                        this.props.cases[this.props.province],
                                        lastConsolidatedDataDay(),
                                        -7,
                                    ))
                                }
                                {
                                    this.props.cases &&
                                    this.getChangeJsx(this.props.cases[this.props.province])
                                }
                            </TableCell>
                            <TableCell>
                                -&nbsp;<InfoBox>
                                    A 7-day rolling average is unnecessary for
                                    the incidence as it already covers the last
                                    14 days.
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalHospitalizations &&
                                    Math.round(getAverageOver(
                                        this.props.totalHospitalizations[this.props.province],
                                        lastConsolidatedDataDay(),
                                        -7,
                                    ))
                                }
                                {
                                    this.props.totalHospitalizations &&
                                    this.getChangeJsx(this.props.totalHospitalizations[this.props.province])
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalICU &&
                                    Math.round(getAverageOver(
                                        this.props.totalICU[this.props.province],
                                        lastConsolidatedDataDay(),
                                        -7,
                                    ))
                                }
                                {
                                    this.props.totalICU &&
                                    this.getChangeJsx(this.props.totalICU[this.props.province])
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.province === 'be' ?
                                        (
                                            this.props.mortality &&
                                            Math.round(getAverageOver(
                                                this.props.mortality[this.props.province],
                                                lastConsolidatedDataDay(),
                                                -7,
                                            ))
                                        ) :
                                        '-'
                                }
                                {
                                    this.props.province === 'be' &&
                                    this.props.mortality &&
                                    this.getChangeJsx(this.props.mortality[this.props.province])
                                }
                            </TableCell>
                        </TableRow>
                        {/* Raw */}
                        <TableRow>
                            <TableCell variant="head">
                                Yesterday's raw numbers
                                &nbsp;<InfoBox>
                                    These values might still change as the data
                                    consolidates.<br/>
                                    Change is shown as compared to the day
                                    before.
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                -&nbsp;<InfoBox>
                                    We are not including this value as it proves
                                    particularly unreliable (it takes several
                                    days for test results to be aggregated into
                                    Sciensano's database).
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                {
                                    this.incidence &&
                                    (
                                        <React.Fragment>
                                            {
                                                Math.round(getAverageOver(
                                                    this.incidence,
                                                    yesterday(),
                                                    1,
                                                ))
                                            }/100k inhabitants
                                        </React.Fragment>
                                    )
                                }
                                {
                                    this.incidence &&
                                    this.getChangeJsx(this.incidence, yesterday(), 1, false)
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalHospitalizations &&
                                    Math.round(getAverageOver(
                                        this.props.totalHospitalizations[this.props.province],
                                        yesterday(),
                                        1,
                                    ))
                                }
                                {
                                    this.props.totalHospitalizations &&
                                    this.getChangeJsx(
                                        this.props.totalHospitalizations[this.props.province],
                                        yesterday(),
                                        1,
                                        false,
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalICU &&
                                    Math.round(getAverageOver(
                                        this.props.totalICU[this.props.province],
                                        yesterday(),
                                        1,
                                    ))
                                }
                                {
                                    this.props.totalICU &&
                                    this.getChangeJsx(
                                        this.props.totalICU[this.props.province],
                                        yesterday(),
                                        1,
                                        false,
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.province === 'be' ?
                                    (
                                        this.props.mortality &&
                                        Math.round(getAverageOver(
                                            this.props.mortality[this.props.province],
                                            yesterday(),
                                            1,
                                        ))
                                    ) :
                                    '-'
                                }
                                {
                                    this.props.province === 'be' &&
                                    this.props.mortality &&
                                    this.getChangeJsx(
                                        this.props.mortality[this.props.province],
                                        yesterday(),
                                        1,
                                        false,
                                    )
                                }
                            </TableCell>
                        </TableRow>
                        {/* Doubling */}
                        <TableRow>
                            <TableCell variant="head">
                                Doubling/Halving period (in days)
                                &nbsp;<InfoBox>
                                    This shows the number of days it would take
                                    to double or halve the 7-day rolling average
                                    on {
                                        lastConsolidatedDataDay().toDateString()
                                    } (the last day for which we have
                                    consolidated data), based on the change with
                                    that of the week before.
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.cases &&
                                    (() => {
                                        const days = this.getDaysToDoubling(this.props.cases[this.props.province]);
                                        return `${Math.abs(days)} (${(
                                            days > 0
                                                ? 'doubling'
                                                : 'halving'
                                        )})`;
                                    })()
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.incidence &&
                                    (() => {
                                        const days = this.getDaysToDoubling(this.incidence);
                                        return `${Math.abs(days)} (${(
                                            days > 0
                                                ? 'doubling'
                                                : 'halving'
                                        )})`;
                                    })()
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalHospitalizations &&
                                    (() => {
                                        const days = this.getDaysToDoubling(this.props.totalHospitalizations[this.props.province]);
                                        return `${Math.abs(days)} (${(
                                            days > 0
                                                ? 'doubling'
                                                : 'halving'
                                        )})`;
                                    })()
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.totalICU &&
                                    (() => {
                                        const days = this.getDaysToDoubling(this.props.totalICU[this.props.province]);
                                        return `${Math.abs(days)} (${(
                                            days > 0
                                                ? 'doubling'
                                                : 'halving'
                                        )})`;
                                    })()
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.province === 'be' ?
                                    (
                                        this.props.mortality &&
                                        (() => {
                                            const days = this.getDaysToDoubling(this.props.mortality[this.props.province]);
                                            return `${Math.abs(days)} (${(
                                                days > 0
                                                    ? 'doubling'
                                                    : 'halving'
                                            )})`;
                                        })()
                                    ) :
                                    '-'
                                }
                            </TableCell>
                        </TableRow>
                        {/* Total */}
                        <TableRow>
                            <TableCell variant="head">
                                Total
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.cases && this.getTotal(this.props.cases[this.props.province])
                                }
                            </TableCell>
                            <TableCell>
                                -
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.newHospitalizations && this.getTotal(this.props.newHospitalizations[this.props.province])
                                }
                            </TableCell>
                            <TableCell>
                                -
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.province === 'be' ?
                                    (
                                        this.props.mortality &&
                                        this.getTotal(this.props.mortality[this.props.province])
                                    ) :
                                    '-'
                                }
                            </TableCell>
                        </TableRow>
                        {/* Total as fraction */}
                        <TableRow>
                            <TableCell variant="head">
                                Total as a fraction of population
                                &nbsp;<InfoBox>
                                    1 person out of n inhabitants of {provinceString(this.props.province)}.
                                </InfoBox>
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.cases &&
                                    `1 / ${Math.round(populationData.totals[this.props.province] / this.getTotal(this.props.cases[this.props.province]))}`
                                }
                            </TableCell>
                            <TableCell>
                                -
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.newHospitalizations &&
                                    `1 / ${Math.round(populationData.totals[this.props.province] / this.getTotal(this.props.newHospitalizations[this.props.province]))}`
                                }
                            </TableCell>
                            <TableCell>
                                -
                            </TableCell>
                            <TableCell>
                                {
                                    this.props.province === 'be' ?
                                    (
                                        this.props.mortality &&
                                        `1 / ${Math.round(populationData.totals[this.props.province] / this.getTotal(this.props.mortality[this.props.province]))}`
                                    ) :
                                    '-'
                                }
                            </TableCell>
                        </TableRow>
                        {/* Comment */}
                        <TableRow>
                            <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                                <small><u>Note</u>: please take the rest of this table with a healthy dose of skepticism. These are not meant as
                                strict predictions but merely to help grasping the current rate of growth. They are naive estimates.</small>
                            </TableCell>
                        </TableRow>
                        {/* Peak */}
                        {
                            <TableRow>
                                <TableCell variant="head">
                                    Day of next peak (at current rate)
                                </TableCell>
                                <TableCell>
                                    {
                                        this.props.cases &&
                                        this.peakCases &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.props.cases[this.props.province],
                                                        this.peakCases.total,
                                                    )
                                                }&nbsp;{
                                                    peakPopover(
                                                        'daily number of cases',
                                                        this.peakCases
                                                    )
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        this.incidence &&
                                        this.peakIncidence &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.incidence,
                                                        this.peakIncidence.total,
                                                    )
                                                }&nbsp;{
                                                    peakPopover(
                                                        'incidence (14d, 100k)',
                                                        this.peakIncidence)
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        this.props.totalHospitalizations &&
                                        this.peakHospitalizations &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.props.totalHospitalizations[this.props.province],
                                                        this.peakHospitalizations.total,
                                                    )
                                                }&nbsp;{
                                                    peakPopover(
                                                        'total number of people at the hospital',
                                                        this.peakHospitalizations
                                                    )
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        this.props.totalICU &&
                                        this.peakICU &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.props.totalICU[this.props.province],
                                                        this.peakICU.total,
                                                    )
                                                }&nbsp;{
                                                    peakPopover(
                                                        'total number of people in intensive care',
                                                        this.peakICU
                                                    )
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        this.props.province === 'be' ?
                                        (
                                            this.props.mortality &&
                                            this.peakMortality &&
                                            (
                                                <React.Fragment>
                                                    {
                                                        this.getDayToValueString(
                                                            this.props.mortality[this.props.province],
                                                            this.peakMortality.total,
                                                        )
                                                    }&nbsp;{
                                                        peakPopover(
                                                            'daily mortality',
                                                            this.peakMortality
                                                        )
                                                    }
                                                </React.Fragment>
                                            )
                                        ) :
                                        '-'
                                    }
                                </TableCell>
                            </TableRow>
                        }
                        {/* Saturation */}
                        {
                            <TableRow>
                                <TableCell variant="head">
                                    Day of saturation (national, at current rate)
                                </TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>
                                    {
                                        this.props.totalHospitalizations &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.props.totalHospitalizations.be,
                                                        AVAILABLE_BEDS,
                                                    )
                                                }&nbsp;{
                                                    saturationPopover()
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        this.props.totalICU &&
                                        (
                                            <React.Fragment>
                                                {
                                                    this.getDayToValueString(
                                                        this.props.totalICU.be,
                                                        TOTAL_ICU_BEDS,
                                                    )
                                                }&nbsp;{
                                                    saturationPopover(true)
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </TableCell>
                                <TableCell>-</TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </React.Fragment>
        );
    }
    getTotal(data) {
        return Object.keys(data).reduce((total, key) => {
            let count = data[key];
            if (typeof count === 'number') {
                return total + count;
            } else if (typeof count === 'object') {
                return total + count.total;
            } else {
                return total;
            }
        }, 0);
    }
    getDayToValue(data, value, limit = lastConsolidatedDataDay()) {
        const interval = 7;
        const day1 = getAverageOver(data, getDateFrom(limit, -(interval)), -7);
        const day2 = getAverageOver(data, limit, -7);
        if (!day2 || day1 >= day2) return;

        const pcChange = (day2 - day1) / day1;
        const n = 1 / interval;
        const daysToSaturation = Math.log(value / day2) / (n * Math.log(1 + (pcChange / n)));
        const saturationDay = getDateFrom(limit, Math.round(daysToSaturation));

        return saturationDay;
    }
    getDayToValueString(data, value, limit = lastConsolidatedDataDay()) {
        const date = this.getDayToValue(data, value, limit);
        if (!date) return 'N.A.';
        const normalizedDate = normalizeDate(date);
        if (normalizedDate > today()) return normalizedDate.toDateString();
        if (getDaysBetween(normalizedDate, today()) === 0) return 'Today';
        return 'Exceeded';
    }
    getChangeRatioOver(data, limit = lastConsolidatedDataDay(), period = 7, overAverage = true) {
        let newValue, oldValue;
        if (overAverage) {
            newValue = getAverageOver(data, limit, -7);
            oldValue = getAverageOver(data, getDateFrom(limit, period * -1), -7);
        } else {
            const newValueObj = data[getIsoDate(limit)];
            newValue = typeof newValueObj === 'number' ? newValueObj : newValueObj.total;
            const oldValueObj = data[getIsoDate(getDateFrom(limit, period * -1))];
            oldValue = typeof oldValueObj === 'number' ? oldValueObj : oldValueObj.total;
        }
        return getChangeRatio(newValue, oldValue);
    }
    getChangeJsx(data, limit = lastConsolidatedDataDay(), period = 7, overAverage = true) {
        const change = this.getChangeRatioOver(data, limit, period, overAverage);
        const style = { color: (change > 0 ? 'red' : 'green') };
        return (
            <small style={style}>
                <sup><strong>
                    {`${change > 0 ? ' +' : ' '}${change}%`}
                </strong></sup>
            </small>
        )
    }
    getDaysToDoubling(data, limit = lastConsolidatedDataDay()) {
        return betterRound(100 / this.getChangeRatioOver(data, limit));
    }

    _getPeak(data) {
        const points = [];
        for (const date of Object.keys(data)) {
            const value = typeof data[date] === 'object' ? data[date].total : data[date];
            points.push({
                x: new Date(date),
                y: value,
            });
        }
        const peakData = getAveragePoints(points, 7).sort((a, b) => b.y - a.y)[0];
        return {
            date: peakData.x,
            total: peakData.y,
        };
    }
}
