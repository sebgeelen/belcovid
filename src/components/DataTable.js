import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, sumByKeyAtDate, getAverageOver, AVAILABLE_ICU_BEDS } from '../helpers';
import ReactTooltip from 'react-tooltip';
import { Table, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

function saturationTooltip(availableBeds, icu = false) {
    return 'This is obviously a very naive calculation:<br>' +
    `If the weekly average of patients ${icu ? 'in intensive care' : 'at the hospital'} continues to rise` +
    ' at the pace it did between yesterday and today,' +
    ` this is the day that ${icu ? 'ICUs' : 'hospitals'} would get overrun.<br><br><br>` +
    `current_patients * (1 + rise_percentage)^days_to_saturation = ${availableBeds}<br>` +
    `<=> days_to_saturation = log(${availableBeds} / current_patients) / log(1 + rise_percentage) <br>` +
    `(where ${availableBeds} is the ` +
    (icu ? 'number of beds available in ICU in Belgium (source: VRT, 2020).' : `total number of hospital beds in Belgium, all` +
    'categories together (source: healthybelgium.be, 2019)).');
}
const CASES_TOOLTIP = 'Excluding the last 4 days, counting from today included, which are not yet consolidated.';

export default class DataTable extends React.Component {
    state = {
        saturationDay: {
            hospitals: this.getSaturationDay('TOTAL_IN', AVAILABLE_BEDS)?.toDateString(),
            icu: this.getSaturationDay('TOTAL_IN_ICU', AVAILABLE_ICU_BEDS)?.toDateString(),
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
                                this.state.saturationDay.hospitals &&
                                <Tr>
                                    <Th>Day of hospital saturation (at current rate)<span data-tip={saturationTooltip(AVAILABLE_BEDS)} style={{color: 'red'}}>*</span></Th>
                                    <Td>{this.state.saturationDay.hospitals}</Td>
                                </Tr>
                            }
                            {
                                this.state.saturationDay.icu &&
                                <Tr>
                                    <Th>Day of ICU saturation (at current rate)<span data-tip={saturationTooltip(AVAILABLE_ICU_BEDS, true)} style={{color: 'red'}}>*</span></Th>
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
}
