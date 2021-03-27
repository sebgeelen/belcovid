import React, { useContext } from 'react';
import { AVAILABLE_BEDS, getDateFrom, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints, getDaysBetween, yesterday, today, normalizeDate, getChangeRatio, betterRound, getIsoDate } from '../helpers';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link, TableHead } from '@material-ui/core';
import InfoBox from './InfoBox';
import { getIncidenceData, provinceString } from '../data/data';
import { MathComponent } from 'mathjax-react';
import { populationData } from '../data/populationData';
import { StatsDataContext } from '../contexts/StatsDataContext';

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
const getTotal = (data) => {
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
};
const getDayToValue = (data, value, limit = lastConsolidatedDataDay()) => {
    const interval = 7;
    const day1 = getAverageOver(data, getDateFrom(limit, -(interval)), -7);
    const day2 = getAverageOver(data, limit, -7);
    if (!day2 || day1 >= day2) return;

    const pcChange = (day2 - day1) / day1;
    const n = 1 / interval;
    const daysToSaturation = Math.log(value / day2) / (n * Math.log(1 + (pcChange / n)));
    const saturationDay = getDateFrom(limit, Math.round(daysToSaturation));

    return saturationDay;
};
const getDayToValueString = (data, value, limit = lastConsolidatedDataDay()) => {
    const date = getDayToValue(data, value, limit);
    if (!date) return 'N.A.';
    const normalizedDate = normalizeDate(date);
    if (normalizedDate > today()) return normalizedDate.toDateString();
    if (getDaysBetween(normalizedDate, today()) === 0) return 'Today';
    return 'Exceeded';
};
const getChangeRatioOver = (data, limit = lastConsolidatedDataDay(), period = 7, overAverage = true) => {
    let newValue, oldValue;
    if (overAverage) {
        newValue = getAverageOver(data, limit, -7);
        oldValue = getAverageOver(data, getDateFrom(limit, period * -1), -7);
    } else {
        const newValueObj = data[getIsoDate(limit)];
        newValue = typeof newValueObj === 'number' ? newValueObj : newValueObj?.total;
        const oldValueObj = data[getIsoDate(getDateFrom(limit, period * -1))];
        oldValue = typeof oldValueObj === 'number' ? oldValueObj : oldValueObj?.total;
    }
    return getChangeRatio(newValue, oldValue);
}
const getChangeJsx = (data, limit = lastConsolidatedDataDay(), period = 7, overAverage = true) => {
    const change = getChangeRatioOver(data, limit, period, overAverage);
    const style = { color: (change > 0 ? 'red' : 'green') };
    return (
        <small style={style}>
            <sup><strong>
                {`${change > 0 ? ' +' : ' '}${change}%`}
            </strong></sup>
        </small>
    )
}
const getDaysToDoubling = (data, limit = lastConsolidatedDataDay()) => {
    const changeRatio = getChangeRatioOver(data, limit) || null;
    return changeRatio && betterRound(100 / changeRatio);
}
const getPeak = data => {
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

export default function DataTable({ province }) {
    const {
        cases,
        totalHospitalizations,
        newHospitalizations,
        totalICU,
        mortality,
    } = useContext(StatsDataContext);

    const incidence = cases && getIncidenceData(cases[province], province);
    const peakCases = cases && getPeak(cases[province]);
    const peakIncidence = incidence && getPeak(incidence);
    const peakHospitalizations = totalHospitalizations && getPeak(totalHospitalizations[province]);
    const peakICU = totalICU && getPeak(totalICU[province]);
    const peakMortality = mortality && getPeak(mortality.be); // Mortality data exists only for Belgium.
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
                                cases &&
                                Math.round(getAverageOver(
                                    cases[province],
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))
                            }
                            {
                                cases &&
                                getChangeJsx(cases[province])
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
                                totalHospitalizations &&
                                Math.round(getAverageOver(
                                    totalHospitalizations[province],
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))
                            }
                            {
                                totalHospitalizations &&
                                getChangeJsx(totalHospitalizations[province])
                            }
                        </TableCell>
                        <TableCell>
                            {
                                totalICU &&
                                Math.round(getAverageOver(
                                    totalICU[province],
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))
                            }
                            {
                                totalICU &&
                                getChangeJsx(totalICU[province])
                            }
                        </TableCell>
                        <TableCell>
                            {
                                province === 'be' ?
                                    (
                                        mortality &&
                                        Math.round(getAverageOver(
                                            mortality[province],
                                            lastConsolidatedDataDay(),
                                            -7,
                                        ))
                                    ) :
                                    '-'
                            }
                            {
                                province === 'be' &&
                                mortality &&
                                getChangeJsx(mortality[province])
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
                                incidence &&
                                (
                                    <React.Fragment>
                                        {
                                            Math.round(getAverageOver(
                                                incidence,
                                                yesterday(),
                                                1,
                                            ))
                                        }/100k inhabitants
                                    </React.Fragment>
                                )
                            }
                            {
                                incidence &&
                                getChangeJsx(incidence, yesterday(), 1, false)
                            }
                        </TableCell>
                        <TableCell>
                            {
                                totalHospitalizations &&
                                Math.round(getAverageOver(
                                    totalHospitalizations[province],
                                    yesterday(),
                                    1,
                                ))
                            }
                            {
                                totalHospitalizations &&
                                getChangeJsx(
                                    totalHospitalizations[province],
                                    yesterday(),
                                    1,
                                    false,
                                )
                            }
                        </TableCell>
                        <TableCell>
                            {
                                totalICU &&
                                Math.round(getAverageOver(
                                    totalICU[province],
                                    yesterday(),
                                    1,
                                ))
                            }
                            {
                                totalICU &&
                                getChangeJsx(
                                    totalICU[province],
                                    yesterday(),
                                    1,
                                    false,
                                )
                            }
                        </TableCell>
                        <TableCell>
                            {
                                province === 'be' ?
                                (
                                    mortality &&
                                    Math.round(getAverageOver(
                                        mortality[province],
                                        yesterday(),
                                        1,
                                    ))
                                ) :
                                '-'
                            }
                            {
                                province === 'be' &&
                                mortality &&
                                getChangeJsx(
                                    mortality[province],
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
                                cases &&
                                (() => {
                                    const days = getDaysToDoubling(cases[province]);
                                    if (days === null) return 'N.A.';
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
                                incidence &&
                                (() => {
                                    const days = getDaysToDoubling(incidence);
                                    if (days === null) return 'N.A.';
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
                                totalHospitalizations &&
                                (() => {
                                    const days = getDaysToDoubling(totalHospitalizations[province]);
                                    if (days === null) return 'N.A.';
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
                                totalICU &&
                                (() => {
                                    const days = getDaysToDoubling(totalICU[province]);
                                    if (days === null) return 'N.A.';
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
                                province === 'be' ?
                                (
                                    mortality &&
                                    (() => {
                                        const days = getDaysToDoubling(mortality[province]);
                                        if (days === null) return 'N.A.';
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
                                cases && getTotal(cases[province])
                            }
                        </TableCell>
                        <TableCell>
                            -
                        </TableCell>
                        <TableCell>
                            {
                                newHospitalizations && getTotal(newHospitalizations[province])
                            }
                        </TableCell>
                        <TableCell>
                            -
                        </TableCell>
                        <TableCell>
                            {
                                province === 'be' ?
                                (
                                    mortality &&
                                    getTotal(mortality[province])
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
                                1 person out of n inhabitants of {provinceString(province)}.
                            </InfoBox>
                        </TableCell>
                        <TableCell>
                            {
                                cases &&
                                `1 / ${Math.round(populationData.totals[province] / getTotal(cases[province]))}`
                            }
                        </TableCell>
                        <TableCell>
                            -
                        </TableCell>
                        <TableCell>
                            {
                                newHospitalizations &&
                                `1 / ${Math.round(populationData.totals[province] / getTotal(newHospitalizations[province]))}`
                            }
                        </TableCell>
                        <TableCell>
                            -
                        </TableCell>
                        <TableCell>
                            {
                                province === 'be' ?
                                (
                                    mortality &&
                                    `1 / ${Math.round(populationData.totals[province] / getTotal(mortality[province]))}`
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
                                    cases &&
                                    peakCases &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    cases[province],
                                                    peakCases.total,
                                                )
                                            }&nbsp;{
                                                peakPopover(
                                                    'daily number of cases',
                                                    peakCases
                                                )
                                            }
                                        </React.Fragment>
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    incidence &&
                                    peakIncidence &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    incidence,
                                                    peakIncidence.total,
                                                )
                                            }&nbsp;{
                                                peakPopover(
                                                    'incidence (14d, 100k)',
                                                    peakIncidence)
                                            }
                                        </React.Fragment>
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    totalHospitalizations &&
                                    peakHospitalizations &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    totalHospitalizations[province],
                                                    peakHospitalizations.total,
                                                )
                                            }&nbsp;{
                                                peakPopover(
                                                    'total number of people at the hospital',
                                                    peakHospitalizations
                                                )
                                            }
                                        </React.Fragment>
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    totalICU &&
                                    peakICU &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    totalICU[province],
                                                    peakICU.total,
                                                )
                                            }&nbsp;{
                                                peakPopover(
                                                    'total number of people in intensive care',
                                                    peakICU
                                                )
                                            }
                                        </React.Fragment>
                                    )
                                }
                            </TableCell>
                            <TableCell>
                                {
                                    province === 'be' ?
                                    (
                                        mortality &&
                                        peakMortality &&
                                        (
                                            <React.Fragment>
                                                {
                                                    getDayToValueString(
                                                        mortality[province],
                                                        peakMortality.total,
                                                    )
                                                }&nbsp;{
                                                    peakPopover(
                                                        'daily mortality',
                                                        peakMortality
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
                                    totalHospitalizations &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    totalHospitalizations.be,
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
                                    totalICU &&
                                    (
                                        <React.Fragment>
                                            {
                                                getDayToValueString(
                                                    totalICU.be,
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
