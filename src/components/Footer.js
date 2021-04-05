import React from 'react';
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { StatsDataContext, UpdateStatus } from '../contexts/StatsDataContext';
import { prettyDate } from '../helpers';
import DoneIcon from '@material-ui/icons/Done';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import ClearIcon from '@material-ui/icons/Clear';
import InfoBox from './InfoBox';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import './footer.css';

export default function Footer() {
    const {updateDates, updateStatus} = React.useContext(StatsDataContext);
    const updateKeys = Object.keys(updateDates);
    const dates = updateKeys.map(key => (
        <small key={key} style={{display: 'block'}}>{key}: {
            updateDates[key]
                ? prettyDate(updateDates[key], true)
                : 'Loading...'}</small>
    ));
    let updateIcon;
    switch (updateStatus) {
        case UpdateStatus.DONE: {
            updateIcon = <DoneIcon style={{color: 'green'}}/>;
            break;
        }
        case UpdateStatus.OUT_OF_SYNC: {
            updateIcon = <ClearIcon style={{color: 'red'}}/>;
            break;
        }
        case UpdateStatus.UPDATING:
        case UpdateStatus.UNKNOWN:
        default: {
            updateIcon = <AutorenewIcon style={{color: 'orange'}}/>;
        }
    }
    return (
        <Container style={{position: 'relative'}}>
            <Typography align="center" variant="body2" color="textSecondary">
                <Link color="inherit" href="https://github.com/Zinston/belcovid" target="_blank" rel="noopener noreferrer">Contribute on GitHub.</Link>
                <br/>
                {'All data from '}
                <Link color="inherit" href="https://www.sciensano.be/" target="_blank" rel="noopener noreferrer">Sciensano</Link>
                {' • '}
                <Link color="inherit" href="https://www.info-coronavirus.be/" target="_blank" rel="noopener noreferrer">Official national information on Covid-19</Link>
                {'.'}
                <br/>
                <small>Most data is truncated to exclude the last 4 days because that data is not yet consolidated.</small>
            </Typography>
            <Box className="paypal-button">
                {/* PayPal donate button */}
                <form action="https://www.paypal.com/donate" method="post" target="_blank">
                    <input type="hidden" name="hosted_button_id" value="VNJGDNN6552YE" />
                    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
                    <img alt="" border="0" src="https://www.paypal.com/en_BE/i/scr/pixel.gif" width="1" height="1" />
                </form>
            </Box>
            <Box style={{position: 'absolute', right: 0, top: 0, padding: 0}}>
                {<InfoBox icon={updateIcon}>
                    Last updates:<br/><br/>
                    {dates}
                </InfoBox>}
            </Box>
        </Container>
    );
}
