import { Avatar, Link, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';

export default class News extends React.Component {
    render() {
        if (this.props.data) {
            const listItems = this.props.data.map((item, index) => {
                const date = new Date(item.pubDate).toDateString();
                return (
                    <ListItem key={`${item.source}-${index}`} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar alt={item.source} src={process.env.PUBLIC_URL + '/icons/' + item.icon}/>
                        </ListItemAvatar>
                        <ListItemText
                            primary={<Link href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</Link>}
                            secondary={`${date} (${item.source.replace('-', ' ')})`}
                        />
                    </ListItem>
                );
            });
            return <List>
                { listItems }
            </List>;
        } else {
            return <Skeleton variant="rect" height={200} />;
        }
    }
}
