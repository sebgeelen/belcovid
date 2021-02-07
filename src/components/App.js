import React, { useEffect, useState } from 'react';
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
} from '../data/data';
import {
    AppBar,
    Box,
    Container,
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
import { getDaysBetween, getFromLocalStorage, isMobile, objectFrom, setIntoLocalStorage, today } from '../helpers.js';
import '../App.css';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import ListItemLink from './ListItemLink.js';
import ShareIcon from '@material-ui/icons/Share';
import Footer from './Footer.js';

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
        marginTop: 20,
    },
});

function App({ classes }) {
    const provinceFromPath = window.location.hash.substring(1);
    const [open, setOpen] = useState(false);
    const [province, setProvince] = useState(
        Object.keys(PROVINCES).includes(provinceFromPath)
            ? provinceFromPath
            : 'be'
    );
    const [cases, setCases] = useState();
    const [totalHospitalizations, setTotalHospitalizations] = useState();
    const [newHospitalizations, setNewHospitalizations] = useState();
    const [totalICU, setTotalICU] = useState();
    const [mortality, setMortality] = useState();
    const [tests, setTests] = useState();
    const [newsData, setNewsData] = useState();

    const _share = () => {
        if (navigator.share) {
            navigator
              .share({
                title: `BelCovid`,
                text: `Take a look at this data about Covid in ${provinceString(province)}.`,
                url: document.location.href,
              })
              .catch(error => {
                console.error('Something went wrong.', error);
              });
          }
    }

    useEffect(() => {
        const lastSaveStats = getFromLocalStorage('belcovid:update:stats');
        const lastSaveNews = getFromLocalStorage('belcovid:update:news');

        const normalizeData = (dataKey, values, ageGroups) => {
            const data = objectFrom(Object.keys(PROVINCES), {});
            for (const item of values) {
                const province = (item.PROVINCE && provinceKey(item.PROVINCE)) || 'be';
                const date = item.DATE;
                if (!date) continue;

                const value = +item[dataKey];
                if (ageGroups) {
                    const ageGroup = item.AGEGROUP || 'Age unknown';
                    if (!data[province][date]) {
                        // Initialize the age group values.
                        data[province][date] = objectFrom(ageGroups, 0);
                    }
                    if (!data.be[date]) {
                        // Initialize the age group values for Belgium.
                        data.be[date] = objectFrom(ageGroups, 0);
                    }
                    const normalizedValue = data[province][date][ageGroup] || 0;
                    // Set province value at date for age group.
                    data[province][date][ageGroup] = normalizedValue + value;
                    // Add to total for province at date.
                    const totalValue = data[province][date].total || 0;
                    data[province][date].total = totalValue + value;
                    // Add to totals for Belgium at date.
                    if (province !== 'be') {
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
                    if (province !== 'be') {
                        const belgiumValue = data.be[date] || 0;
                        data.be[date] = belgiumValue + value;
                    }
                }
            }
            return data;
        };
        const updateStats = () => {
            const dataPromises = fetchStatsData();
            for (const dataPromise of dataPromises) {
                dataPromise.then(([key, values]) => {
                    let data;
                    switch (key) {
                        case 'cases': {
                            data = normalizeData('CASES', values, AGE_GROUPS_CASES);
                            setCases(data);
                            break;
                        }
                        case 'hospitalizations': {
                            data = normalizeData('TOTAL_IN', values);
                            setTotalHospitalizations(data);
                            setIntoLocalStorage('belcovid:totalHospitalizations', JSON.stringify(data));

                            data = normalizeData('NEW_IN', values);
                            setNewHospitalizations(data);
                            setIntoLocalStorage('belcovid:newHospitalizations', JSON.stringify(data));

                            data = normalizeData('TOTAL_IN_ICU', values);
                            setTotalICU(data);
                            setIntoLocalStorage('belcovid:totalICU', JSON.stringify(data));
                            return;
                        }
                        case 'mortality': {
                            data = normalizeData('DEATHS', values, AGE_GROUPS_MORTALITY);
                            setMortality(data);
                            break;
                        }
                        case 'tests': {
                            data = normalizeData('TESTS_ALL', values, AGE_GROUPS_MORTALITY);
                            setTests(data);
                            break;
                        }
                        default: return;
                    }
                    setIntoLocalStorage('belcovid:' + key, JSON.stringify(data));
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:stats', today().toISOString());
            });
        }
        const updateNews = () => {
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
                setNewsData(data);
                setIntoLocalStorage('belcovid:news', JSON.stringify(data));
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:news', today().toISOString());
            });
        }

        // Update stats data.
        if (lastSaveStats) {
            const lastSaveDate = new Date(lastSaveStats);
            const lastSaveHours = (lastSaveDate.getTime() - today().getTime()) / (1000 * 60 * 60);
            const areStatsExpired = getDaysBetween(lastSaveDate, today()) !== 0 || lastSaveHours >= 12;
            if (areStatsExpired) {
                // Data are too old: update.
                // eslint-disable-next-line no-console
                console.log('epidemiological data expired. Updating...');
                updateStats();
            } else {
                let areStatsMissing = false;
                for (const [key, setter] of [
                    ['cases', setCases],
                    ['totalHospitalizations', setTotalHospitalizations],
                    ['newHospitalizations', setNewHospitalizations],
                    ['totalICU', setTotalICU],
                    ['mortality', setMortality],
                    ['tests', setTests],
                ]) {
                    const statsData = getFromLocalStorage('belcovid:' + key);
                    if (statsData) {
                        setter(JSON.parse(statsData));
                    } else {
                        // Some stats are missing: update.
                        areStatsMissing = true;
                        break;
                    }
                }
                if (areStatsMissing) {
                    // eslint-disable-next-line no-console
                    console.log('Some epidemiological data was not saved properly. Updating...');
                    updateStats();
                }
            }
        } else {
            // eslint-disable-next-line no-console
            console.log('Fetching epidemiological data for the first time...');
            updateStats();
        }

        // Update news data.
        if (lastSaveNews) {
            const storedNewsData = getFromLocalStorage('belcovid:news');
            const lastSaveDate = new Date(lastSaveNews);
            const lastSaveHours = (today().getTime() - lastSaveDate.getTime()) / (1000 * 60 * 60);
            if (storedNewsData && lastSaveHours < 1) {
                setNewsData(JSON.parse(storedNewsData));
            } else {
                updateNews();
            }
        } else {
            updateNews();
        }
    }, []);

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="absolute"
                className={
                    clsx(
                        classes.appBar,
                        open && classes.appBarShift
                    )
                }
            >
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={() => setOpen(true)}
                        className={
                            clsx(
                                classes.menuButton,
                                open && classes.menuButtonHidden
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
                        className={classes.title}
                    >
                        BelCovid
                    </Typography>
                    <FormControl className={classes.formControl}>
                        <Select
                            id="province-select"
                            value={province}
                            onChange={ev => setProvince(ev.target.value)}
                        >
                            { Object.keys(PROVINCES).map(key => {
                                return (
                                    <MenuItem
                                        value={key}
                                        key={key}
                                        component={RouterLink}
                                        to={{ hash: key }}
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
                        classes.drawerPaper,
                        !open && classes.drawerPaperClose
                    ),
                }}
                open={open}
            >
                <div className={classes.toolbarIcon}>
                    <IconButton onClick={() => setOpen(false)}>
                        <ChevronLeftIcon />
                    </IconButton>
                </div>
                <Divider />
                <List>
                    <ListItemLink to={`/${window.location.hash}`} primary="Dashboard" icon={<DashboardIcon />} exact />
                    <ListItemLink to={`/charts${window.location.hash}`} primary="Charts" icon={<BarChartIcon />} />
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Container maxWidth="lg" className={classes.container}>
                    <Switch>
                        <Route path="/charts">
                            <Charts
                                classes={classes}
                                cases={cases?.[province]}
                                newHospitalizations={newHospitalizations?.[province]}
                                totalHospitalizations={totalHospitalizations?.[province]}
                                totalICU={totalICU?.[province]}
                                mortality={mortality?.[province]}
                                tests={tests?.[province]}
                                province={province}
                            />
                        </Route>
                        <Route path="/">
                            <Dashboard
                                classes={classes}
                                cases={cases}
                                totalHospitalizations={totalHospitalizations}
                                newHospitalizations={newHospitalizations}
                                totalICU={totalICU}
                                mortality={mortality}
                                newsData={newsData}
                                province={province}
                            />
                        </Route>
                    </Switch>
                    <Box pt={4}>
                        <Footer />
                    </Box>
                </Container>
            </main>
            {
                isMobile() && navigator.share &&
                <Fab
                    size="small"
                    color="primary"
                    aria-label="share"
                    style={{
                        position: 'absolute',
                        bottom: 30,
                        right: 30,
                    }}
                    onClick={_share}
                >
                    <ShareIcon/>
                </Fab>
            }
        </div>
    );
}

export default withStyles(styles)(App);
