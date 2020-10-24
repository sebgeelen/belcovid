import React from 'react';
import clsx from 'clsx';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import DataTable from './DataTable';
import Title from './Title';
import ChartByAge from './charts/ChartByAge';
import { Skeleton } from '@material-ui/lab';
import News from './News';
import { PROVINCES } from '../data';
import { getFromLocalStorage } from '../helpers';
import { dataInfo } from './charts/Charts';

function Footer() {
  const lastStatsUpdate = getFromLocalStorage('belcovid:update:stats');
  const lastStatsUpdateDate = lastStatsUpdate && new Date(lastStatsUpdate);
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'All data from '}
      <Link color="inherit" href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</Link>
      {
        getFromLocalStorage('belcovid:update:stats') ?
          <small onDoubleClick={() => {
            if (window.localStorage) {
              window.localStorage.clear();
            }
          }}> (last update: {lastStatsUpdateDate.toDateString()} at {lastStatsUpdateDate.toLocaleTimeString()})</small> :
          ''
      }
      {' • '}
      <Link color="inherit" href="https://www.info-coronavirus.be/" target="_blank" rel="noopener noreferrer">Official national information on Covid-19</Link>
      {'.'}
      <br/>
      <small>Data is truncated to exclude the last 4 days because that data is not yet consolidated.</small>
    </Typography>
  );
}

export default class Dashboard extends React.Component {
  classes = this.props.classes;
  fixedHeightPaper = clsx(this.classes.paper, this.classes.fixedHeight);

  render() {
    const chartInfo = dataInfo.cases.average;
    return (
      <main className={this.classes.content}>
        <div className={this.classes.appBarSpacer} />
        <Container maxWidth="lg" className={this.classes.container}>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={7} lg={7}>
              <Paper className={this.fixedHeightPaper} style={{height: '100%', width: '100%'}}>
                <Title>New cases, by age group (7-day rolling average) in {PROVINCES[this.props.province]}</Title>
                {this.props.allCasesData ?
                    <ChartByAge
                      classes={this.classes}
                      data={this.props.allCasesData[this.props.province]}
                      annotations={chartInfo.annotations}
                      chartName={chartInfo.title}
                      asImage={true}
                      ageGroups={chartInfo.ageGroups}
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
                    cases={this.props.allCasesData?.Belgium}
                    totalHospitalizations={this.props.totalHospitalizations}
                    totalICU={this.props.totalICU}
                  /> :
                  <Skeleton variant="rect" height={200} />
                }
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            <Footer />
          </Box>
        </Container>
      </main>
    );
  }
}
