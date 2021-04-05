import React, { useContext } from 'react';
import clsx from 'clsx';
import Title from './Title';
import { provinceString } from '../data/data';
import { dataInfo } from './charts/Charts';
import { lastConsolidatedDataDay } from '../helpers';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Skeleton from '@material-ui/lab/Skeleton';
import TableContainer from '@material-ui/core/TableContainer';
import withStyles from '@material-ui/core/styles/withStyles';
import { StatsDataContext } from '../contexts/StatsDataContext';
import { NewsDataContextProvider } from '../contexts/NewsDataContext';
import { styles } from '../styles';
const ChartByAge = React.lazy(() => import('./charts/ChartByAge'));
const DataTable = React.lazy(() => import('./DataTable'));
const News = React.lazy(() => import('./News'));

function Dashboard({ province, classes }) {
	const {
		cases,
		totalHospitalizations,
		newHospitalizations,
		totalICU,
		mortality,
	} = useContext(StatsDataContext);
	const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
	const chartInfo = dataInfo.cases.average;
	return (
		<Grid container spacing={3}>
			{/* Chart */}
			<Grid item xs={12} md={7} lg={7}>
			<Paper className={fixedHeightPaper} style={{height: '100%', width: '100%'}}>
				<Title>New cases, by age group (7-day rolling average) in {provinceString(province)}</Title>
				{cases ?
					<React.Suspense fallback={<Skeleton variant="rect" height={'100%'} />}>
						<ChartByAge
							data={cases[province]}
							annotations={chartInfo.annotations}
							chartName={chartInfo.title}
							asImage={true}
							ageGroups={chartInfo.ageGroups}
							max={lastConsolidatedDataDay()}
						/>
					</React.Suspense> :
				<Skeleton variant="rect" height={'100%'} />
				}
			</Paper>
			</Grid>
			{/* Recent News */}
			<Grid item xs={12} md={5} lg={5}>
			<Paper className={fixedHeightPaper}>
				<Title>Latest news</Title>
				<React.Suspense fallback={<Skeleton variant="rect" height={'100%'} />}>
					<NewsDataContextProvider>
						<News/>
					</NewsDataContextProvider>
				</React.Suspense>
			</Paper>
			</Grid>
			{/* Recent Data */}
			<Grid item xs={12}>
			<Paper className={classes.paper}>
				<Title>Today in {provinceString(province)}</Title>
				{cases || totalHospitalizations || totalICU || newHospitalizations || mortality ?
				<React.Suspense fallback={<Skeleton variant="rect" height={200} />}>
					<TableContainer component={Paper} style={{ border: 0, boxShadow: 'none'}}>
						<DataTable province={province}/>
					</TableContainer>
				</React.Suspense> :
				<Skeleton variant="rect" height={200} />
				}
			</Paper>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(Dashboard);
