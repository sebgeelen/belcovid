import React from 'react';
import clsx from 'clsx';
import Dashboard from './Dashboard.js';
import Charts from './charts/Charts.js';
import { fetchStatsData, fetchNewsData } from '../data';
import { AppBar, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, withStyles } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import BarChartIcon from '@material-ui/icons/BarChart';
import { getDaysBetween, today } from '../helpers.js';
import '../App.css';

const drawerWidth = 240;
const styles = (theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 300,
    },
    flagButton: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 5,
        paddingRight: 5,
    },
});

class App extends React.Component {
  state = {
    open: false,
    page: localStorage.getItem('belcovid:page') || 'dashboard',
  };
  classes = this.props.classes;
  async componentDidMount() {
    const lastSaveStats = localStorage.getItem('belcovid:update:stats');
    const lastSaveNews = localStorage.getItem('belcovid:update:news');

    // Update stats data.
    if (lastSaveStats) {
      const statsData = localStorage.getItem('belcovid:stats');
      const lastSaveDate = new Date(lastSaveStats);
      const lastSaveHours = (lastSaveDate.getTime() - today().getTime()) / (1000 * 60 * 60);
      if (statsData && getDaysBetween(lastSaveDate, today()) === 0 && lastSaveHours < 12) {
        this.setState({ statsData: JSON.parse(statsData) });
      } else {
        this._updateData('stats');
      }
    } else {
      this._updateData('stats');
    }

    // Update news data.
    if (lastSaveNews) {
      const newsData = localStorage.getItem('belcovid:news');
      const lastSaveDate = new Date(lastSaveStats);
      const lastSaveHours = (today().getTime() - lastSaveDate.getTime()) / 3600;
      if (newsData && lastSaveHours < 1) {
        this.setState({ newsData: JSON.parse(newsData) });
      } else {
        this._updateData('news');
      }
    } else {
      this._updateData('news');
    }
  }
  render() {
    let main;
    switch (this.state.page) {
      case 'dashboard':
        main = <Dashboard classes={this.classes} statsData={this.state.statsData} newsData={this.state.newsData}/>;
        break;
      case 'charts':
        main = <Charts classes={this.classes} data={this.state.statsData}/>;
        break;
      default:
        main = null;
    }
    return (
      <div className={this.classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(this.classes.appBar, this.state.open && this.classes.appBarShift)}>
          <Toolbar className={this.classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this._handleDrawerOpen.bind(this)}
              className={clsx(this.classes.menuButton, this.state.open && this.classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={this.classes.title}>
              BelCovid
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(this.classes.drawerPaper, !this.state.open && this.classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={this.classes.toolbarIcon}>
            <IconButton onClick={this._handleDrawerClose.bind(this)}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem
              button
              selected={this.state.page === 'dashboard'}
              onClick={this._goto.bind(this, 'dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              selected={this.state.page === 'charts'}
              onClick={this._goto.bind(this, 'charts')}
            >
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Charts" />
            </ListItem>
          </List>
        </Drawer>
        {main}
      </div>
    );
  }
  _updateData(name) {
    if (name === 'stats') {
      fetchStatsData().then(data => {
        localStorage.setItem('belcovid:stats', JSON.stringify(data));
        localStorage.setItem('belcovid:update:stats', today().toISOString());
        this.setState({ statsData: data });
      });
    } else if (name === 'news') {
      const data = [];
      const dataPromises = fetchNewsData();
      for (const dataPromise of dataPromises) {
        dataPromise.promise.then(datum => {
          for (const item of datum) {
            const formattedItem = { ...dataPromise, ...item };
            delete formattedItem.promise;
            if (!formattedItem.pubDate && formattedItem.date) {
              formattedItem.pubDate = formattedItem.date;
            }
            data.push(formattedItem);
          }
          this.setState({ newsData: data });
          localStorage.setItem('belcovid:news', JSON.stringify(data));
          localStorage.setItem('belcovid:update:news', today().toISOString());
        });
      }
    }
  }
  _goto(page) {
    this.setState({ page });
    localStorage.setItem('belcovid:page', page);
  }
  _handleDrawerOpen() {
    this.setState({ open: true });
  }
  _handleDrawerClose() {
    this.setState({ open: false });
  }
}

export default withStyles(styles)(App);
