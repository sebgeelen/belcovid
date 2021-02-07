import React, { useContext } from 'react';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import DataTable from './DataTable';
import Title from './Title';
import ChartByAge from './charts/ChartByAge';
import { Skeleton } from '@material-ui/lab';
import News from './News';
import { provinceString } from '../data/data';
import { dataInfo } from './charts/Charts';
import { lastConsolidatedDataDay } from '../helpers';
import { TableContainer } from '@material-ui/core';
import { DataContext } from './App';

export default function Dashboard() {
	const {
		classes,
		cases,
		totalHospitalizations,
		newHospitalizations,
		totalICU,
		mortality,
		newsData,
		province,
	} = useContext(DataContext);
	const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
	const chartInfo = dataInfo.cases.average;
	return (
		<Grid container spacing={3}>
			{/* Chart */}
			<Grid item xs={12} md={7} lg={7}>
			<Paper className={fixedHeightPaper} style={{height: '100%', width: '100%'}}>
				<Title>New cases, by age group (7-day rolling average) in {provinceString(province)}</Title>
				{cases ?
					<ChartByAge
						data={cases[province]}
						annotations={chartInfo.annotations}
						chartName={chartInfo.title}
						asImage={true}
						ageGroups={chartInfo.ageGroups}
						max={lastConsolidatedDataDay()}
					/> :
				<Skeleton variant="rect" height={'100%'} />
				}
			</Paper>
			</Grid>
			{/* Recent News */}
			<Grid item xs={12} md={5} lg={5}>
			<Paper className={fixedHeightPaper}>
				<Title>Latest news</Title>
				<News data={newsData} classes={classes}/>
			</Paper>
			</Grid>
			{/* Recent Data */}
			<Grid item xs={12}>
			<Paper className={classes.paper}>
				<Title>Today in {provinceString(province)}</Title>
				{cases || totalHospitalizations || totalICU || newHospitalizations || mortality ?
				<TableContainer component={Paper} style={{ border: 0, boxShadow: 'none'}}>
					<DataTable/>
				</TableContainer> :
				<Skeleton variant="rect" height={200} />
				}
			</Paper>
			</Grid>
		</Grid>
	);
}
