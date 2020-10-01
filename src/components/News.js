import { Link, List, ListItem, ListItemText } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import Parser from 'rss-parser';
const parser = new Parser();

const proxy = 'https://cors-anywhere.herokuapp.com/';
const sourcesUrls = {
    vrt: 'https://www.vrt.be/vrtnws/en.rss.wetenschap.xml',
};
export default class News extends React.Component {
    data;
    async componentDidMount() {
        this.data = await this._getAllData();
    }
    render() {
        if (this.data) {
            const listItems = this.data.map(item => {
                const date = new Date(item.pubDate).toDateString();
                return (
                    <ListItem key={item.id} alignItems="flex-start">
                        <ListItemText
                            primary={<Link href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</Link>}
                            secondary={`${date} (${item.source})`}
                        />
                    </ListItem>
                );
            });
            return <List>
                { listItems }
            </List>;
        }
        return <Skeleton variant="rect" height={200} />;
    }
    async _getData(url) {
        const feed = await parser.parseURL(proxy + url);
        const coronaItems = feed.items.filter(a => a.title.toLowerCase().includes('corona'));
        return coronaItems;
    }
    async _getAllData() {
        let data = [];
        for (const source of Object.keys(sourcesUrls)) {
            const newData = await this._getData(sourcesUrls[source]);
            for (const item of newData) {
                item.source = source;
            }
            data = [...data, ...newData];
        }
        return data.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
    }
}
