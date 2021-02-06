import React from 'react';
import { Typography, Link } from "@material-ui/core";
import { getFromLocalStorage } from "../helpers";

export default function Footer() {
    const lastStatsUpdate = getFromLocalStorage('belcovid:update:stats');
    const lastStatsUpdateDate = lastStatsUpdate && new Date(lastStatsUpdate);
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            <Link color="inherit" href="https://github.com/Zinston/belcovid" target="_blank" rel="noopener noreferrer">Contribute on GitHub.</Link>
            <br/>
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
            <small>Most data is truncated to exclude the last 4 days because that data is not yet consolidated.</small>
        </Typography>
    );
}
