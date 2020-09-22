import React from 'react';
import { Chart } from 'react-charts';
import { ResizableArea } from 'react-resizable-area';

function PeopleInHospitalChart(props) {
    let hospiData = props.data?.hospi || [];
    if (props.start) {
        hospiData = hospiData.filter(item => new Date(item.DATE) > props.start);
    }
    const dates = new Set(hospiData?.map(item => item.DATE));
    const points = [];
    for (const date of dates) {
        const items = hospiData.filter(item => item.DATE === date);
        const patients = items.reduce((a, b) => a + b.TOTAL_IN, 0) || 0;
        points.push({x: new Date(date), y: patients});
    }
    const data = React.useMemo(
        () => [
        {
            label: 'Number of people in the hospital',
            data: points,
        },
        ], [points]
    );
    const series = React.useMemo(
        () => ({
            showPoints: false,
        }),
        []
    );

    const axes = React.useMemo(
        () => [
        { primary: true, type: 'utc', position: 'bottom' },
        { type: 'linear', position: 'left' }
        ],
        []
    );

    return (
        // A react-chart hyper-responsively and continuously fills the available
        // space of its parent element automatically
        <div
            style={{
                width: '90%',
                height: '300px',
                paddingLeft: '50px',
            }}
        >
            <ResizableArea
                initHeight={{px: 0, percent: 100}}
                initWidth={{px: 0, percent: 100}}
            >
                <Chart data={data} series={series} axes={axes} tooltip primaryCursor secondaryCursor />
            </ResizableArea>
        </div>
    );
}

export default PeopleInHospitalChart;
