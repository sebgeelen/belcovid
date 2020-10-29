import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints, today, getDaysBetween } from '../helpers';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link, TableHead } from '@material-ui/core';
import { InfoBox } from './InfoBox';
import { getIncidenceData } from '../data';

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
            7-day rolling average to account for statistical noise.
        </InfoBox>
    );
}
const truncatedDataInfoBox = (
    <InfoBox>
        Excluding the last 4 days, counting from
        today included, which are not yet
        consolidated.
    </InfoBox>
);

export default class DataTable extends React.Component {
    peakHospitalizations = null;
    peakICU = null;
    render() {
        if (this.props.cases && !this.peakCases) {
            this.peakCases = this._getPeak(this.props.cases);
        }
        if (this.props.cases && !this.peakIncidence) {
            this.incidence = getIncidenceData(this.props.cases);
            this.peakIncidence = this._getPeak(this.incidence);
        }
        if (this.props.totalHospitalizations && !this.peakHospitalizations) {
            this.peakHospitalizations = this._getPeak(this.props.totalHospitalizations);
        }
        if (this.props.totalICU && !this.peakICU) {
            this.peakICU = this._getPeak(this.props.totalICU);
        }
        if (this.props.mortality && !this.peakMortality) {
            this.peakMortality = this._getPeak(this.props.mortality);
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
                        {/* Daily average */}
                        <TableRow>
                            <TableCell variant="head">
                                Daily average (7 days)
                            </TableCell>
                            <TableCell>
                                {this.props.cases &&
                                Math.round(getAverageOver(
                                    this.props.cases,
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))}
                                &nbsp;{truncatedDataInfoBox}
                            </TableCell>
                            <TableCell>
                                {this.incidence &&
                                Math.round(getAverageOver(
                                    this.incidence,
                                    today(),
                                    1,
                                )) + '/100k inhabitants'}
                            </TableCell>
                            <TableCell>
                                {this.props.totalHospitalizations &&
                                Math.round(getAverageOver(
                                    this.props.totalHospitalizations,
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))}
                                &nbsp;{truncatedDataInfoBox}
                            </TableCell>
                            <TableCell>
                                {this.props.totalICU &&
                                Math.round(getAverageOver(
                                    this.props.totalICU,
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))}
                                &nbsp;{truncatedDataInfoBox}
                            </TableCell>
                            <TableCell>
                                {this.props.mortality &&
                                Math.round(getAverageOver(
                                    this.props.mortality,
                                    lastConsolidatedDataDay(),
                                    -7,
                                ))}
                                &nbsp;{truncatedDataInfoBox}
                            </TableCell>
                        </TableRow>
                        {/* Comment */}
                        {
                            (this.props.totalHospitalizations || this.props.totalICU) &&
                            <TableRow>
                                <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                                    <small><u>Note</u>: please take the rest of this table with a healthy dose of skepticism. These are not meant as
                                    strict predictions but merely to help grasping the current rate of growth. They are naive estimates.</small>
                                </TableCell>
                            </TableRow>
                        }
                        {/* Peak */}
                        {
                            <TableRow>
                                <TableCell variant="head">
                                    Day of next peak (at current rate)
                                </TableCell>
                                <TableCell>{ this.props.cases &&
                                    this.peakCases &&
                                    this.getDayToValueString(
                                        this.props.cases,
                                        this.peakCases.total,
                                    )
                                }&nbsp;{peakPopover(
                                    'daily number of cases',
                                    this.peakCases)}
                                </TableCell>
                                <TableCell>{ this.incidence &&
                                    this.peakIncidence &&
                                    this.getDayToValueString(
                                        this.incidence,
                                        this.peakIncidence.total,
                                    )
                                }&nbsp;{peakPopover(
                                    'incidence (14d, 100k)',
                                    this.peakIncidence)}
                                </TableCell>
                                <TableCell>{ this.props.totalHospitalizations &&
                                    this.peakHospitalizations &&
                                    this.getDayToValueString(
                                        this.props.totalHospitalizations,
                                        this.peakHospitalizations.total,
                                    )
                                }&nbsp;{peakPopover(
                                    'total number of people at the hospital',
                                    this.peakHospitalizations)}
                                </TableCell>
                                <TableCell>{ this.props.totalICU &&
                                    this.peakICU &&
                                    this.getDayToValueString(
                                        this.props.totalICU,
                                        this.peakICU.total,
                                    )
                                }&nbsp;{peakPopover(
                                    'total number of people in intensive care',
                                    this.peakICU)
                                }
                                </TableCell>
                                <TableCell>{
                                        this.getDayToValueString(
                                            this.props.mortality,
                                            this.peakMortality.total,
                                        )
                                    }&nbsp;{peakPopover(
                                        'daily mortality',
                                        this.peakMortality)}
                                </TableCell>
                            </TableRow>
                        }
                        {/* Saturation */}
                        {
                            <TableRow>
                                <TableCell variant="head">
                                    Day of saturation (at current rate)
                                </TableCell>
                                <TableCell/>
                                <TableCell/>
                                <TableCell>{
                                    this.props.totalHospitalizations &&
                                    this.getDayToValueString(
                                        this.props.totalHospitalizations,
                                        AVAILABLE_BEDS,
                                    )
                                }&nbsp;{saturationPopover()}</TableCell>
                                <TableCell>{
                                    this.props.totalICU &&
                                    this.getDayToValueString(
                                        this.props.totalICU,
                                        TOTAL_ICU_BEDS,
                                    )
                                }&nbsp;{saturationPopover(true)}</TableCell>
                                <TableCell/>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </React.Fragment>
        );
    }
    getDayToValue(data, value, limit = lastConsolidatedDataDay()) {
        const interval = 7;
        const day1 = getAverageOver(data, getDateFrom(limit, -(interval)), -6);
        const day2 = getAverageOver(data, limit, -6);
        if (!day2 || day1 >= day2) return;

        const pcChange = (day2 - day1) / day1;
        const daysToSaturation = interval * (Math.floor(Math.log(value / day2) / Math.log((1 + pcChange))));
        const saturationDay = getDateFrom(limit, daysToSaturation);

        return saturationDay;
    }
    getDayToValueString(data, value, limit = lastConsolidatedDataDay()) {
        const date = this.getDayToValue(data, value, limit);
        if (!date) return '';
        return getDaysBetween(date, limit) ? date.toDateString() : 'Exceeded';
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
