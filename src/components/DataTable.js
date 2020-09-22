import React from 'react';
import { AVAILABLE_BEDS, getIsoDate, getDateFrom } from '../helpers';
import ReactTooltip from 'react-tooltip';
import { Table, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const saturationTooltip = 'This is obviously a very naive calculation:<br>' +
    'If the number of patients at the hospital continues to rise<br>' +
    'at the pace it did between yesterday and today,<br>' +
    'this is the day that hospitals would get overrun.';

export default class DataTable extends React.Component {
    state = {
        saturationDay: this.getSaturationDay().toDateString(),
    }
    render() {
        if (this.props.data) {
            return (
                <Table className="bordered">
                    <Tbody>
                        <Tr>
                            <Th>Cases (weekly average)</Th>
                            <Td>{Math.round(this._getAverageOver(this.props.data.cases, getDateFrom(new Date(), -8), new Date(), 'CASES'))}</Td>
                        </Tr>
                        {
                            this.state.saturationDay &&
                            <Tr>
                                <Th>Projected day of hospital saturation<span data-tip={saturationTooltip} style={{color: 'red'}}>*</span></Th>
                                <Td>{this.state.saturationDay}</Td>
                                <ReactTooltip multiline/>
                            </Tr>
                        }
                    </Tbody>
                </Table>
            );
        } else {
            return <p>Loading...</p>;
        }
    }
    getSaturationDay() {
        const hospiData = this.props.data?.hospi;
        if (!hospiData) return;

        const hospiDay1 = this._sumByKeyAtDate(hospiData, getDateFrom(new Date(), -2), 'TOTAL_IN');
        const hospiDay2 = this._sumByKeyAtDate(hospiData, getDateFrom(new Date(), -1), 'TOTAL_IN');
        if (!hospiDay2 || hospiDay1 >= hospiDay2) return;

        const pcChange = (hospiDay2 - hospiDay1) / hospiDay1;
        const daysToSaturation = Math.log(AVAILABLE_BEDS / hospiDay2) / Math.log((1 + pcChange));
        const saturationDay = getDateFrom(new Date(), daysToSaturation + 1);

        return saturationDay;
    }
    getCasesOn(date) {
        const casesData = this.props.data?.cases;
        return casesData && this._sumByKeyAtDate(casesData, date, 'CASES');
    }

    _filterByDate(data, date) {
        return data.filter(item => item.DATE === getIsoDate(date));
    }
    _sumByKey(data, key) {
        return data.map(item => item[key]).reduce((a, b) => a + b, 0);
    }
    _sumByKeyAtDate(data, date, key) {
        const dataAtDate = this._filterByDate(data, date);
        return this._sumByKey(dataAtDate, key);
    }
    _getAverageOver(data, startDate, endDate, key) {
        let date = startDate;
        const values = [this._sumByKeyAtDate(data, date, key)];
        do {
            date = getDateFrom(date, +1);
            values.push(this._sumByKeyAtDate(data, date, key));
        } while (date && getIsoDate(date) !== getIsoDate(endDate));
        return (values.length && values.reduce((a, b) => a + b, 0) / values.length) || 0;
    }
}
