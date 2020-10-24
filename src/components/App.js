import React from 'react';
import clsx from 'clsx';
import Dashboard from './Dashboard.js';
import Charts from './charts/Charts.js';
import {
    fetchStatsData,
    fetchNewsData,
    PROVINCES,
    AGE_GROUPS_CASES,
    AGE_GROUPS_MORTALITY,
    provinceString,
    provinceKey
} from '../data';
import {
    AppBar,
    CssBaseline,
    Divider,
    Drawer,
    Fab,
    FormControl,
    IconButton,
    List,
    MenuItem,
    Select,
    Toolbar,
    Typography,
    withStyles
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import BarChartIcon from '@material-ui/icons/BarChart';
import { getDaysBetween, getFromLocalStorage, isMobile, lastConsolidatedDataDay, setIntoLocalStorage, today } from '../helpers.js';
import '../App.css';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import ListItemLink from './ListItemLink.js';
import ShareIcon from '@material-ui/icons/Share';

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
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    chartSection: {
        height: 400,
        marginBottom: 60,
    },
});

class App extends React.Component {
    provinceFromPath = window.location.search.substring(1);
    state = {
        open: false,
        province: (Object.keys(PROVINCES).includes(this.provinceFromPath) && this.provinceFromPath)
            || 'be',
    };
    classes = this.props.classes;

    async componentDidMount() {
        const lastSaveStats = getFromLocalStorage('belcovid:update:stats');
        const lastSaveNews = getFromLocalStorage('belcovid:update:news');

        // Update stats data.
        if (lastSaveStats) {
            const lastSaveDate = new Date(lastSaveStats);
            const lastSaveHours = (lastSaveDate.getTime() - today().getTime()) / (1000 * 60 * 60);
            const areStatsExpired = getDaysBetween(lastSaveDate, today()) !== 0 || lastSaveHours >= 12;
            if (areStatsExpired) {
                // Data are too old: update.
                // eslint-disable-next-line no-console
                console.log('epidemiological data expired. Updating...');
                this._updateData('stats');
            } else {
                const statsToSet = {};
                let areStatsMissing = false;
                for (const key of ['cases', 'totalHospitalizations', 'totalICU', 'mortality', 'tests']) {
                    const statsData = getFromLocalStorage('belcovid:' + key);
                    if (statsData) {
                        statsToSet[key] = JSON.parse(statsData);
                    } else {
                        // Some stats are missing: update.
                        areStatsMissing = true;
                        break;
                    }
                }
                if (areStatsMissing) {
                    // eslint-disable-next-line no-console
                    console.log('Some epidemiological data was not saved properly. Updating...');
                    this._updateData('stats');
                } else {
                    this.setState(statsToSet);
                }
            }
        } else {
            // eslint-disable-next-line no-console
            console.log('Fetching epidemiological data for the first time...');
            this._updateData('stats');
        }

        // Update news data.
        if (lastSaveNews) {
            const newsData = getFromLocalStorage('belcovid:news');
            const lastSaveDate = new Date(lastSaveNews);
            const lastSaveHours = (today().getTime() - lastSaveDate.getTime()) / (1000 * 60 * 60);
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
        return (
            <div className={this.classes.root}>
                <CssBaseline />
                <AppBar
                    position="absolute"
                    className={
                        clsx(
                            this.classes.appBar,
                            this.state.open && this.classes.appBarShift
                        )
                    }
                >
                    <Toolbar className={this.classes.toolbar}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this._handleDrawerOpen.bind(this)}
                            className={
                                clsx(
                                    this.classes.menuButton,
                                    this.state.open && this.classes.menuButtonHidden
                                )
                            }
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            className={this.classes.title}
                        >
                            BelCovid
                        </Typography>
                        <FormControl className={this.classes.formControl}>
                            <Select
                                id="province-select"
                                value={this.state.province}
                                onChange={ev => this.setState({ province: ev.target.value })}
                            >
                                { Object.keys(PROVINCES).map(key => {
                                    return (
                                        <MenuItem
                                            value={key}
                                            key={key}
                                            component={RouterLink}
                                            to={{
                                                search: key,
                                                state: {
                                                    ...this.state,
                                                    ...{
                                                        province: Object.keys(PROVINCES).includes(key) ? key : 'be',
                                                    }},
                                            }}
                                        >
                                            {provinceString(key)}
                                        </MenuItem>
                                    );
                                }) }
                            </Select>
                        </FormControl>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(
                            this.classes.drawerPaper,
                            !this.state.open && this.classes.drawerPaperClose
                        ),
                    }}
                    open={this.state.open}
                >
                    <div className={this.classes.toolbarIcon}>
                        <IconButton
                            onClick={this._handleDrawerClose.bind(this)}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <ListItemLink to={`/${window.location.search}`} primary="Dashboard" icon={<DashboardIcon />} exact />
                        <ListItemLink to={`/charts${window.location.search}`} primary="Charts" icon={<BarChartIcon />} />
                    </List>
                </Drawer>
                <Switch>
                    <Route path="/charts">
                        <Charts
                            classes={this.classes}
                            cases={this.state.cases?.[this.state.province]}
                            totalHospitalizations={this.state.totalHospitalizations?.[this.state.province]}
                            totalICU={this.state.totalICU?.[this.state.province]}
                            mortality={this.state.mortality?.[this.state.province]}
                            tests={this.state.tests?.[this.state.province]}
                            province={this.state.province}
                        />
                    </Route>
                    <Route path="/">
                        <Dashboard
                            classes={this.classes}
                            allCasesData={this.state.cases}
                            totalHospitalizations={this.state.totalHospitalizations?.be}
                            totalICU={this.state.totalICU?.be}
                            newsData={this.state.newsData}
                            province={this.state.province}
                        />
                    </Route>
                </Switch>
                {
                    isMobile() &&
                    <Fab
                        size="small"
                        color="primary"
                        aria-label="share"
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            right: 30,
                        }}
                        onClick={this._share.bind(this)}
                    >
                        <ShareIcon/>
                    </Fab>
                }
            </div>
        );
    }
    _share() {
        if (navigator.share) {
            navigator
              .share({
                title: `BelCovid`,
                text: `Take a look at this data about Covid in ${provinceString(this.state.province)}.`,
                url: document.location.href,
              })
              .catch(error => {
                console.error('Something went wrong.', error);
              });
          }
    }
    _updateData(name) {
        if (name === 'stats') {
            const dataPromises = fetchStatsData();
            for (const dataPromise of dataPromises) {
                dataPromise.then(datum => {
                    const key = datum[0];
                    const values = datum[1];
                    const normalizedData = this._normalizeData(key, values);
                    for (const newKey of Object.keys(normalizedData)) {
                        setIntoLocalStorage('belcovid:' + newKey, JSON.stringify(normalizedData[newKey]));
                        this.setState({ [newKey]: normalizedData[newKey] });
                    }
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:stats', today().toISOString());
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
                setIntoLocalStorage('belcovid:news', JSON.stringify(data));
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:news', today().toISOString());
            });
        }
    }
    _normalizeData(key, values) {
        let dataKey;
        let ageGroups;
        switch (key) {
            case 'cases': {
                dataKey = 'CASES';
                ageGroups = AGE_GROUPS_CASES;
                break;
            }
            case 'hospitalizations': {
                return {
                    ...this._normalizeData('totalHospitalizations', values),
                    ...this._normalizeData('totalICU', values),
                };
            }
            case 'totalHospitalizations': {
                dataKey = 'TOTAL_IN';
                break;
            }
            case 'totalICU': {
                dataKey = 'TOTAL_IN_ICU';
                break;
            }
            case 'mortality': {
                dataKey = 'DEATHS';
                ageGroups = AGE_GROUPS_MORTALITY;
                break;
            }
            case 'tests': {
                dataKey = 'TESTS_ALL';
                break;
            }
            default:
                return {};
        }
        const data = Object.keys(PROVINCES).reduce((object, province) => {
            object[province] = {};
            return object;
        }, {});
        const limitDay = lastConsolidatedDataDay();
        for (const item of values) {
            const province = (item.PROVINCE && provinceKey(item.PROVINCE)) || 'be';
            const date = item.DATE;
            // Ignore days for which the data is not yet consolidated.
            if (!date || new Date(date) > limitDay) continue;

            const value = +item[dataKey];
            if (ageGroups) {
                const ageGroup = item.AGEGROUP || 'Age unknown';
                if (!data[province][date]) {
                    // Initialize the age group values.
                    data[province][date] = ageGroups.reduce((groupsObject, groupName) => {
                        groupsObject[groupName] = 0;
                        return groupsObject;
                    }, {});
                }
                if (!data.be[date]) {
                    // Initialize the age group values for Belgium.
                    data.be[date] = ageGroups.reduce((groupsObject, groupName) => {
                        groupsObject[groupName] = 0;
                        return groupsObject;
                    }, {});
                }
                const normalizedValue = data[province][date][ageGroup] || 0;
                // Set province value at date for age group.
                data[province][date][ageGroup] = normalizedValue + value;
                // Add to total for province at date.
                const totalValue = data[province][date].total || 0;
                data[province][date].total = totalValue + value;
                // Add to totals for Belgium at date.
                if (province !== 'Belgium') {
                    if (!data.be[date]) {
                        data.be[date] = {};
                    }
                    // Add to total for Belgium at date for age group.
                    const belgiumValue = data.be[date][ageGroup] || 0;
                    data.be[date][ageGroup] = belgiumValue + value;
                    // Add to total for Belgium at date.
                    const belgiumTotal = data.be[date].total || 0;
                    data.be[date].total = belgiumTotal + value;
                }
            } else {
                const provinceValue = data[province][date] || 0;
                // Set province value at date.
                data[province][date] = provinceValue + value;
                // Add to total for Belgium at date.
                if (province !== 'Belgium') {
                    const belgiumValue = data.be[date] || 0;
                    data.be[date] = belgiumValue + value;
                }
            }
        }
        return { [key]: data };
    }
    _handleDrawerOpen() {
        this.setState({ open: true });
    }
    _handleDrawerClose() {
        this.setState({ open: false });
    }
}

export default withStyles(styles)(App);
