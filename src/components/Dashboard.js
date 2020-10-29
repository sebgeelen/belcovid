import React from 'react';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import DataTable from './DataTable';
import Title from './Title';
import ChartByAge from './charts/ChartByAge';
import { Skeleton } from '@material-ui/lab';
import News from './News';
import { provinceString } from '../data';
import { dataInfo } from './charts/Charts';
import { lastConsolidatedDataDay } from '../helpers';

export default class Dashboard extends React.Component {
  classes = this.props.classes;
  fixedHeightPaper = clsx(this.classes.paper, this.classes.fixedHeight);

  render() {
    const chartInfo = dataInfo.cases.average;
    return (
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={7} lg={7}>
          <Paper className={this.fixedHeightPaper} style={{height: '100%', width: '100%'}}>
            <Title>New cases, by age group (7-day rolling average) in {provinceString(this.props.province)}</Title>
            {this.props.allCasesData ?
                <ChartByAge
                  classes={this.classes}
                  data={this.props.allCasesData[this.props.province]}
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
          <Paper className={this.fixedHeightPaper}>
            <Title>Latest news</Title>
            <News data={this.props.newsData} classes={this.classes}/>
          </Paper>
        </Grid>
        {/* Recent Data */}
        <Grid item xs={12}>
          <Paper className={this.classes.paper} style={{ overflow: 'hidden' }}>
            <Title>Today in Belgium</Title>
            {this.props.allCasesData || this.props.totalHospitalizations || this.props.totalICU ?
              <DataTable
                cases={this.props.allCasesData?.be}
                totalHospitalizations={this.props.totalHospitalizations}
                totalICU={this.props.totalICU}
              /> :
              <Skeleton variant="rect" height={200} />
            }
          </Paper>
        </Grid>
      </Grid>
    );
  }
}
