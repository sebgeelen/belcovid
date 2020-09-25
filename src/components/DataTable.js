import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, sumByKeyAtDate, getAverageOver, TOTAL_ICU_BEDS, lastConsolidatedDataDay, getAveragePoints } from '../helpers';
import ReactTooltip from 'react-tooltip';
import { Table, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

function saturationTooltip(icu = false) {
    return `The day that all available ${icu ? 'ICU' : 'hospital'} beds would
        be in use if the 7-day rolling average total number of COVID-19
        patients in ${icu ? 'ICU' : 'hospitals'} were to keep growing at
        the same pace.<br><br>
        ${icu ? `Source on the number of beds in ICU: VRT, 2020.` :
        `Sources on the number of hospital beds and the average number of
        hospitalized patients per day: KCE, 2014 and healthybelgium.be.`}`;
}
const CASES_TOOLTIP = 'Excluding the last 4 days, counting from today included, which are not yet consolidated.';
function peakTooltip(peak) {
    return `The day that the number of people at the hospital would be the same
        as on the highest day recorded (${peak.x.toDateString()}: ${Math.round(peak.y)}),
        based on 7-day rolling average to account for statistical noise.`;
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
                <div>
                    <Table className="bordered">
                        <Tbody>
                            <Tr>
                                <Th>Cases (last 7 days, daily average)<span data-tip={CASES_TOOLTIP} style={{color: 'red'}}>*</span></Th>
                                <Td>{Math.round(getAverageOver(this.props.data.cases, lastConsolidatedDataDay(), -6, 'CASES'))}</Td>
                            </Tr>
                            {
                                (this.state.saturationDay.hospitals || this.state.saturationDay.icu || this.state.saturationDay.peak) &&
                                <Tr>
                                    <Td colSpan={2} style={{ textAlign: 'center' }}>
                                        <small><u>Note</u>: please take the rest of this table with a healthy dose of skepticism. These are not meant as
                                        strict predictions but merely to help grasping the current rate of growth. They are naive estimates.</small>
                                    </Td>
                                </Tr>
                            }
                            {
                                this.state.saturationDay.peak &&
                                <Tr>
                                    <Th>Day of new peak (at current rate)<span data-tip={peakTooltip(this._getPeak('TOTAL_IN'))} style={{color: 'red'}}>*</span></Th>
                                    <Td>{this.state.saturationDay.peak}</Td>
                                </Tr>
                            }
                            {
                                this.state.saturationDay.hospitals &&
                                <Tr>
                                    <Th>Day of hospital saturation (at current rate)<span data-tip={saturationTooltip()} style={{color: 'red'}}>*</span></Th>
                                    <Td>{this.state.saturationDay.hospitals}</Td>
                                </Tr>
                            }
                            {
                                this.state.saturationDay.icu &&
                                <Tr>
                                    <Th>Day of ICU saturation (at current rate)<span data-tip={saturationTooltip(true)} style={{color: 'red'}}>*</span></Th>
                                    <Td>{this.state.saturationDay.icu}</Td>
                                </Tr>
                            }
                        </Tbody>
                    </Table>
                    <ReactTooltip multiline/>
                </div>
            );
        } else {
            return <p>Loading...</p>;
        }
    }
    getSaturationDay(key, availableBeds) {
        const hospiData = this.props.data?.hospi;
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
        const hospiData = this.props.data?.hospi;
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
