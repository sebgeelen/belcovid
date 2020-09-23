import React from 'react';
import { AVAILABLE_BEDS, getDateFrom, sumByKeyAtDate, getAverageOver } from '../helpers';
import ReactTooltip from 'react-tooltip';
import { Table, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const saturationTooltip = 'This is obviously a very naive calculation:<br>' +
    'If the number of patients at the hospital continues to rise<br>' +
    'at the pace it did between yesterday and today,<br>' +
    'this is the day that hospitals would get overrun.';

export default class DataTable extends React.Component {
    state = {
        saturationDay: this.getSaturationDay()?.toDateString(),
    }
    render() {
        if (this.props.data) {
            return (
                <div>
                    <Table className="bordered">
                        <Tbody>
                            <Tr>
                                <Th>Cases (weekly average)</Th>
                                <Td>{Math.round(getAverageOver(this.props.data.cases, new Date(), -8, 'CASES'))}</Td>
                            </Tr>
                            {
                                this.state.saturationDay &&
                                <Tr>
                                    <Th>Projected day of hospital saturation<span data-tip={saturationTooltip} style={{color: 'red'}}>*</span></Th>
                                    <Td>{this.state.saturationDay}</Td>
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
    getSaturationDay() {
        const hospiData = this.props.data?.hospi;
        if (!hospiData) return;

        const hospiDay1 = getAverageOver(hospiData, getDateFrom(new Date(), -2), -7, 'TOTAL_IN');
        const hospiDay2 = getAverageOver(hospiData, getDateFrom(new Date(), -1), -7, 'TOTAL_IN');
        if (!hospiDay2 || hospiDay1 >= hospiDay2) return;

        const pcChange = (hospiDay2 - hospiDay1) / hospiDay1;
        const daysToSaturation = Math.log(AVAILABLE_BEDS / hospiDay2) / Math.log((1 + pcChange));
        const saturationDay = getDateFrom(new Date(), daysToSaturation + 1);

        return saturationDay;
    }
    getCasesOn(date) {
        const casesData = this.props.data?.cases;
        return casesData && sumByKeyAtDate(casesData, date, 'CASES');
    }
}
