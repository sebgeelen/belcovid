import React, { useState } from 'react';
import clsx from 'clsx';
import {
    PROVINCES,
    provinceString,
} from '../data/data';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Fab from '@material-ui/core/Fab';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import BarChartIcon from '@material-ui/icons/BarChart';
import { isMobile } from '../helpers.js';
import '../App.css';
import { Link as RouterLink, Route, Switch } from 'react-router-dom';
import ListItemLink from './ListItemLink.js';
import ShareIcon from '@material-ui/icons/Share';
import Footer from './Footer.js';
import { StatsDataContextProvider } from '../contexts/StatsDataContext.js';
import { styles } from '../styles.js';
const Charts = React.lazy(() => import('./charts/Charts.js'));
const Dashboard = React.lazy(() => import('./Dashboard.js'));

function App({ classes }) {
    const provinceFromPath = window.location.hash.substring(1).replace(/\?.*$/, '');
    const [open, setOpen] = useState(false);
    const [province, setProvince] = useState(
        Object.keys(PROVINCES).includes(provinceFromPath)
            ? provinceFromPath
            : 'be'
    );

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
    };

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
                    <ListItemLink to={`/${province && '#' + province}`} primary="Dashboard" icon={<DashboardIcon />} exact />
                    <ListItemLink to={`/charts${province && '#' + province}`} primary="Charts" icon={<BarChartIcon />} />
                </List>
            </Drawer>
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Container maxWidth="lg" className={classes.container}>
                        <Switch>
                            <Route path="/charts">
                                <StatsDataContextProvider>
                                    <React.Suspense fallback={
                                        <div className={classes.root}>
                                            <CircularProgress style={{margin: 'auto'}}/>
                                        </div>}>
                                        <Charts province={province}/>
                                    </React.Suspense>
                                </StatsDataContextProvider>
                            </Route>
                            <Route path="/">
                                <StatsDataContextProvider>
                                    <React.Suspense fallback={
                                        <div className={classes.root}>
                                            <CircularProgress style={{margin: 'auto'}}/>
                                        </div>}>
                                        <Dashboard province={province}/>
                                    </React.Suspense>
                                </StatsDataContextProvider>
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
