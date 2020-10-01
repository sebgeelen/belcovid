import { Link, List, ListItem, ListItemText } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import Parser from 'rss-parser';
const parser = new Parser();

const proxy = 'https://cors-anywhere.herokuapp.com/';
const sourcesUrls = {
    'vrt-science-en': 'https://www.vrt.be/vrtnws/en.rss.wetenschap.xml',
    'vrt-wetenschap-nl': 'https://www.vrt.be/vrtnws/nl.rss.wetenschap.xml',
    'rtbf-info': 'http://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml'
};
export default class News extends React.Component {
    state = {}
    async componentDidMount() {
        const data = await this._getAllData();
        this.setState({ data });
    }
    render() {
        if (this.state.data) {
            const listItems = this.state.data.map((item, index) => {
                const date = new Date(item.pubDate).toDateString();
                return (
                    <ListItem key={`${item.source}-${index}`} alignItems="flex-start">
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
    async _getData(url) {
        const feed = await parser.parseURL(proxy + url);
        const coronaItems = feed.items.filter(a => {
            return a.title.toLowerCase().includes('corona') || a.description?.toLowerCase().includes('corona');
        });
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
        return data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    }
}
