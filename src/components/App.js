import React from 'react';
import clsx from 'clsx';
import Dashboard from './Dashboard.js';
import Charts from './charts/Charts.js';
import { fetchStatsData, fetchNewsData, PROVINCES, AGE_GROUPS } from '../data';
import {
    AppBar,
    CssBaseline,
    Divider,
    Drawer,
    FormControl,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
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
import { getDaysBetween, getFromLocalStorage, setIntoLocalStorage, today } from '../helpers.js';
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
    state = {
        open: false,
        page: (getFromLocalStorage('belcovid:page')) || 'dashboard',
        province: (getFromLocalStorage('belcovid:province')) || 'Belgium',
    };
    classes = this.props.classes;
    _isFilteringStatsData = false;

    async componentDidMount() {
        const lastSaveStats = getFromLocalStorage('belcovid:update:stats');
        const lastSaveNews = getFromLocalStorage('belcovid:update:news');

        // Update stats data.
        if (lastSaveStats) {
            const statsData = getFromLocalStorage('belcovid:stats');
            const lastSaveDate = new Date(lastSaveStats);
            const lastSaveHours = (lastSaveDate.getTime() - today().getTime()) / (1000 * 60 * 60);
            if (statsData && getDaysBetween(lastSaveDate, today()) === 0 && lastSaveHours < 12) {
                this.setState({ rawStatsData: JSON.parse(statsData) });
            } else {
                this._updateData('stats');
            }
        } else {
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
    // async componentWillUpdate(nextProps, nextState) {
    //     if (
    //         !this._isFilteringStatsData && (
    //             this.state.rawStatsData !== nextState.rawStatsData ||
    //             !nextState.statsData ||
    //             this.state.province !== nextState.province
    //         )
    //     ) {
    //         this._isFilteringStatsData = true;
    //         await this.setState({statsData: this._filterStatsData(nextState.rawStatsData, nextState.province)});
    //         this._isFilteringStatsData = false;
    //     }
    //     return true;
    // }
    render() {
        let main;
        switch (this.state.page) {
            case 'dashboard':
                main = <Dashboard
                    classes={this.classes}
                    cases={this.state.cases}
                    totalHospitalizations={this.state.totalHospitalizations}
                    totalICU={this.state.totalICU}
                    mortality={this.state.mortality}
                    tests={this.state.tests}
                    statsData={this.state.statsData}
                    newsData={this.state.newsData}
                    province={this.state.province}
                />;
                break;
            case 'charts':
                main = <Charts
                    classes={this.classes}
                    data={this.state.statsData}
                    province={this.state.province}
                />;
                break;
            default:
                main = null;
        }
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
                                onChange={ev => {
                                    const province = ev.target.value;
                                    setIntoLocalStorage('belcovid:province', province);
                                    this.setState({ province });
                                }}
                            >
                                { Object.keys(PROVINCES).map(key => {
                                    return (
                                        <MenuItem
                                            value={key}
                                            key={key}
                                        >
                                            {PROVINCES[key]}
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
                console.log(this.state);
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
    _filterStatsData(rawStatsData, province) {
        if (province === 'Belgium') {
            return rawStatsData;
        } else if (rawStatsData) {
            const data = {};
            for (const name of Object.keys(rawStatsData)) {
                if (name === 'mortality') {
                    // The mortality dataset doesn't have the data per province.
                    data[name] = rawStatsData[name];
                } else {
                    data[name] = rawStatsData[name].filter(data => {
                        return data.PROVINCE === province;
                    });
                }
            }
            return data;
        }
    }
    _normalizeData(key, values) {
        let dataKey;
        let withAgeGroups = false;
        switch (key) {
            case 'cases': {
                dataKey = 'CASES';
                withAgeGroups = true;
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
                withAgeGroups = true;
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
        for (const item of values) {
            const province = item.PROVINCE || 'Belgium';
            const date = item.DATE;
            if (!date) continue;

            const value = +item[dataKey];
            if (withAgeGroups) {
                const ageGroup = item.AGEGROUP || 'Age unknown';
                if (!data[province][date]) {
                    // Initialize the age group values.
                    data[province][date] = AGE_GROUPS.reduce((groupsObject, groupName) => {
                        groupsObject[groupName] = 0;
                        return groupsObject;
                    }, {});
                }
                if (!data.Belgium[date]) {
                    // Initialize the age group values for Belgium.
                    data.Belgium[date] = AGE_GROUPS.reduce((groupsObject, groupName) => {
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
                    if (!data.Belgium[date]) {
                        data.Belgium[date] = {};
                    }
                    // Add to total for Belgium at date for age group.
                    const belgiumValue = data.Belgium[date][ageGroup] || 0;
                    data.Belgium[date][ageGroup] = belgiumValue + value;
                    // Add to total for Belgium at date.
                    const belgiumTotal = data.Belgium[date].total || 0;
                    data.Belgium[date].total = belgiumTotal + value;
                }
            } else {
                const provinceValue = data[province][date] || 0;
                // Set province value at date.
                data[province][date] = provinceValue + value;
                // Add to total for Belgium at date.
                if (province !== 'Belgium') {
                    const belgiumValue = data.Belgium[date] || 0;
                    data.Belgium[date] = belgiumValue + value;
                }
            }
        }
        return { [key]: data };
    }
    _goto(page) {
        this.setState({ page });
        setIntoLocalStorage('belcovid:page', page);
    }
    _handleDrawerOpen() {
        this.setState({ open: true });
    }
    _handleDrawerClose() {
        this.setState({ open: false });
    }
}

export default withStyles(styles)(App);
