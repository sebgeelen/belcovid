import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints } from '../helpers';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link } from '@material-ui/core';
import { InfoBox } from './InfoBox';

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
            The day that all available {icu ? 'ICU' : 'hospital'} beds would be
            in use if the 7-day rolling average total number of COVID-19
            patients in {icu ? 'ICU' : 'hospitals'} were to keep growing at the
            same pace.<br/>
            <br/>
            {source}
        </InfoBox>
    );
}
function peakPopover(peak) {
    return (
        <InfoBox>
            The day that the number of people at the hospital would be the same
            as on the highest day recorded
            ({peak.date.toDateString()}:&nbsp;{Math.round(peak.total)}), based on
            7-day rolling average to account for statistical noise.
        </InfoBox>
    );
}

export default class DataTable extends React.Component {
    peakHospitalizations = null;
    peakICU = null;
    render() {
        if (this.props.totalHospitalizations && !this.peakHospitalizations) {
            this.peakHospitalizations = this._getPeak(this.props.totalHospitalizations);
        }
        if (this.props.totalICU && !this.peakICU) {
            this.peakICU = this._getPeak(this.props.totalICU);
        }
        return (
            <React.Fragment>
                <Table size="small">
                    <TableBody>
                        {
                            this.props.cases &&
                            <TableRow>
                                <TableCell>
                                    Cases (last 7 days, daily average)
                                    <InfoBox>
                                        Excluding the last 4 days, counting from
                                        today included, which are not yet
                                        consolidated.
                                    </InfoBox>
                                </TableCell>
                                <TableCell>
                                    {Math.round(getAverageOver(
                                        this.props.cases,
                                        lastConsolidatedDataDay(),
                                        -7,
                                    ))}
                                </TableCell>
                            </TableRow>
                        }
                        {
                            (this.props.totalHospitalizations || this.props.totalICU) &&
                            <TableRow>
                                <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                                    <small><u>Note</u>: please take the rest of this table with a healthy dose of skepticism. These are not meant as
                                    strict predictions but merely to help grasping the current rate of growth. They are naive estimates.</small>
                                </TableCell>
                            </TableRow>
                        }
                        {
                            this.props.totalHospitalizations &&
                            <TableRow>
                                <TableCell>
                                    Day of new total in hospital peak
                                    (at current rate)&nbsp;{peakPopover(this.peakHospitalizations)}
                                </TableCell>
                                <TableCell>{
                                    this.getSaturationDay(
                                        this.props.totalHospitalizations,
                                        this.peakHospitalizations.total,
                                    )?.toDateString()
                                }</TableCell>
                            </TableRow>
                        }
                        {
                            this.props.totalHospitalizations &&
                            <TableRow>
                                <TableCell>
                                    Day of hospital saturation
                                    (at current rate)&nbsp;{saturationPopover()}
                                </TableCell>
                                <TableCell>{
                                    this.getSaturationDay(
                                        this.props.totalHospitalizations,
                                        AVAILABLE_BEDS,
                                    )?.toDateString()
                                }</TableCell>
                            </TableRow>
                        }
                        {
                            this.props.totalICU &&
                            <TableRow>
                                <TableCell>
                                    Day of ICU saturation
                                    (at current rate)&nbsp;{saturationPopover(true)}
                                </TableCell>
                                <TableCell>{
                                    this.getSaturationDay(
                                        this.props.totalICU,
                                        TOTAL_ICU_BEDS,
                                    )?.toDateString()
                                }</TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </React.Fragment>
        );
    }
    getSaturationDay(data, availableBeds) {
        const interval = 7;
        const day1 = getAverageOver(data, getDateFrom(lastConsolidatedDataDay(), -(interval)), -6);
        const day2 = getAverageOver(data, lastConsolidatedDataDay(), -6);
        if (!day2 || day1 >= day2) return;

        const pcChange = (day2 - day1) / day1;
        const daysToSaturation = interval * (Math.floor(Math.log(availableBeds / day2) / Math.log((1 + pcChange))));
        const saturationDay = getDateFrom(lastConsolidatedDataDay(), daysToSaturation);

        return saturationDay;
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
