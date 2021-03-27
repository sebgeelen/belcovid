import React from 'react';
import { fetchNewsData } from '../data/data';
import { getFromLocalStorage, setIntoLocalStorage, today } from '../helpers';

export const NewsDataContext = React.createContext({});

export function NewsDataContextProvider({children}) {
    const [newsData, setNewsData] = React.useState([]);
    const setData = (setter, data, localStorageKey) => {
        setter(data);
        setIntoLocalStorage(localStorageKey, JSON.stringify(data));
    };
    React.useEffect(() => {
        const lastSaveNews = getFromLocalStorage('belcovid:update:news');

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
                setData(setNewsData, data, 'belcovid:news');
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:news', new Date().toISOString());
            });
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
        <NewsDataContext.Provider value={{newsData}}>
            {children}
        </NewsDataContext.Provider>
    );
}