import React from 'react';
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { StatsDataContext } from '../contexts/StatsDataContext';
import { isExpired } from '../helpers';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';

export default function Footer() {
    const {updateDates} = React.useContext(StatsDataContext);
    const isUpToDate = Object.keys(updateDates).every(key => !isExpired(updateDates[key]));
    return (
        <Typography variant="body2" color="textSecondary" align="center" style={{position: 'relative'}}>
            <Link color="inherit" href="https://github.com/Zinston/belcovid" target="_blank" rel="noopener noreferrer">Contribute on GitHub.</Link>
            <br/>
            {'All data from '}
            <Link color="inherit" href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</Link>
            {' • '}
            <Link color="inherit" href="https://www.info-coronavirus.be/" target="_blank" rel="noopener noreferrer">Official national information on Covid-19</Link>
            {'.'}
            <br/>
            <small>Most data is truncated to exclude the last 4 days because that data is not yet consolidated.</small>
            <small style={{position: 'absolute', right: 0, top: 0, padding: 0}}>
                { isUpToDate ? <DoneIcon style={{color: 'green'}}/> : <ClearIcon style={{color: 'red'}}/>}
            </small>
        </Typography>
    );
}
