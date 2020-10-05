import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, sumByKeyAtDate, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints } from '../helpers';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Link, Tooltip } from '@material-ui/core';

function saturationTooltip(icu = false) {
    let source;
    if (icu) {
        source = (<small><i>
            Source on the number of beds in ICU: <Link href="https://www.vrt.be/vrtnws/en/2020/03/22/health-minister-says-that-an-additional-759-intensive-care-beds/">VRT, 2020.</Link>
        </i></small>);
    } else {
        source = (<small><i>
            Sources on the number of hospital beds and the average number of
            hospitalized patients per day: <Link href="https://kce.fgov.be/sites/default/files/atoms/files/T%C3%A9l%C3%A9charger%20la%20synth%C3%A8se%20en%20fran%C3%A7ais%20%2884%20p.%29.pdf">KCE, 2014</Link> and
            <Link href="https://www.healthybelgium.be/en/key-data-in-healthcare/general-hospitals/organisation-of-the-hospital-landscape/categorisation-of-hospital-activities/evolution-of-the-number-of-accredited-hospital-beds">healthybelgium.be</Link>.
        </i></small>);
    }
    return (
        <React.Fragment>
            The day that all available ${icu ? 'ICU' : 'hospital'} beds would
            be in use if the 7-day rolling average total number of COVID-19
            patients in {icu ? 'ICU' : 'hospitals'} were to keep growing at
            the same pace.<br/>
            <br/>
            {source}
        </React.Fragment>
    );
}
const CASES_TOOLTIP = 'Excluding the last 4 days, counting from today included, which are not yet consolidated.';
function peakTooltip(peak) {
    return (
        <React.Fragment>
            The day that the number of people at the hospital would be the same
            as on the highest day recorded ({peak.x.toDateString()}: {Math.round(peak.y)}),
            based on 7-day rolling average to account for statistical noise.
        </React.Fragment>
    );
}

export default class DataTable extends React.Component {
    state = {
        saturationDay: {
            hospitals: this.getSaturationDay('TOTAL_IN', AVAILABLE_BEDS)?.toDateString(),
            icu: this.getSaturationDay('TOTAL_IN_ICU', TOTAL_ICU_BEDS)?.toDateString(),
            peak: this.getSaturationDay('TOTAL_IN', this._getPeak('TOTAL_IN')?.y || 0)?.toDateString(),
        },
    }
    render() {
        if (this.props.data) {
            return (
                <React.Fragment>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <Tooltip title={CASES_TOOLTIP} placement="bottom-start" arrow>
                                    <TableCell>Cases (last 7 days, daily average)</TableCell>
                                </Tooltip>
                                <TableCell>{Math.round(getAverageOver(this.props.data.cases, lastConsolidatedDataDay(), -7, 'CASES'))}</TableCell>
                            </TableRow>
                            {
                                (this.state.saturationDay.hospitals || this.state.saturationDay.icu || this.state.saturationDay.peak) &&
                                <TableRow>
                                    <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                                        <small><u>Note</u>: please take the rest of this table with a healthy dose of skepticism. These are not meant as
                                        strict predictions but merely to help grasping the current rate of growth. They are naive estimates.</small>
                                    </TableCell>
                                </TableRow>
                            }
                            {
                                this.state.saturationDay.peak &&
                                <TableRow>
                                    <Tooltip title={peakTooltip(this._getPeak('TOTAL_IN'))} placement="bottom-start" arrow>
                                        <TableCell>Day of new total in hospital peak (at current rate)</TableCell>
                                    </Tooltip>
                                    <TableCell>{this.state.saturationDay.peak}</TableCell>
                                </TableRow>
                            }
                            {
                                this.state.saturationDay.hospitals &&
                                <TableRow>
                                    <Tooltip title={saturationTooltip()} placement="bottom-start" arrow>
                                        <TableCell>Day of hospital saturation (at current rate)</TableCell>
                                    </Tooltip>
                                    <TableCell>{this.state.saturationDay.hospitals}</TableCell>
                                </TableRow>
                            }
                            {
                                this.state.saturationDay.icu &&
                                <TableRow>
                                    <Tooltip title={saturationTooltip(true)} placement="bottom-start" arrow>
                                        <TableCell>Day of ICU saturation (at current rate)</TableCell>
                                    </Tooltip>
                                    <TableCell>{this.state.saturationDay.icu}</TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </React.Fragment>
            );
        } else {
            return <p>Loading...</p>;
        }
    }
    getSaturationDay(key, availableBeds) {
        const hospiData = this.props.data?.hospitalisations;
        if (!hospiData) return;

        const hospiDay1 = getAverageOver(hospiData, getDateFrom(lastConsolidatedDataDay(), -1), -6, key);
        const hospiDay2 = getAverageOver(hospiData, lastConsolidatedDataDay(), -6, key);
        if (!hospiDay2 || hospiDay1 >= hospiDay2) return;

        const pcChange = (hospiDay2 - hospiDay1) / hospiDay1;
        const daysToSaturation = Math.floor(Math.log(availableBeds / hospiDay2) / Math.log((1 + pcChange)));
        const saturationDay = getDateFrom(lastConsolidatedDataDay(), daysToSaturation);

        return saturationDay;
    }
    getCasesOn(date) {
        const casesData = this.props.data?.cases;
        return casesData && sumByKeyAtDate(casesData, date, 'CASES');
    }

    _getPeak(key) {
        const hospiData = this.props.data?.hospitalisations;
        if (!hospiData) return;

        const dates = new Set(hospiData.map(item => item.DATE));
        const points = [];
        for (const date of dates) {
            const items = hospiData.filter(item => item.DATE === date);
            const values = items.reduce((a, b) => a + b[key], 0) || 0;
            points.push({x: new Date(date), y: values});
        }
        return getAveragePoints(points, 7).sort((a, b) => b.y - a.y)[0];
    }
}
