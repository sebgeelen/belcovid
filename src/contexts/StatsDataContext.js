import React from 'react';
import diff from 'changeset';
import { fetchData, PROXY } from '../data/data';
import { getFromLocalStorage, isExpired, objectFrom, setIntoLocalStorage } from '../helpers';

const API_URL = `${PROXY}https://belcovid-db.herokuapp.com`;
const KEYS = [
    'cases',
    'totalHospitalizations',
    'newHospitalizations',
    'totalICU',
    'mortality',
    'tests',
    'vaccinationPartial',
    'vaccinationFull',
];
export const UpdateStatus = {
    UNKNOWN: 'unknown',
    OUT_OF_SYNC: 'out of sync',
    UPDATING: 'updating',
    DONE: 'done',
};

export const StatsDataContext = React.createContext({});

export function StatsDataContextProvider({children}) {
    const [values, setValues] = React.useState(objectFrom(KEYS, key => JSON.parse(getFromLocalStorage(`belcovid:${key}`))));
    const [updateStatus, setUpdateStatus] = React.useState(UpdateStatus.UNKNOWN);
    const [updateDates, setUpdateDates] = React.useState(objectFrom(KEYS, key => getFromLocalStorage(`belcovid:update:${key}`)));

    const lastFetchedIds = objectFrom(KEYS, key => getFromLocalStorage(`belcovid:diffId:${key}`));

    // Update stats data.
    React.useEffect(() => {
        async function fetchAllData () {
            const res = await fetch(`${API_URL}/update-time`);
            const jsonRes = await res.json();
            const lastServerUpdateTime = jsonRes.datetime;
            let newValues = {...values};
            let newUpdateDates = {...updateDates};
            for (const key of KEYS) {
                const lastUpdateTime = getFromLocalStorage(`belcovid:update:${key}`);
                if (!lastUpdateTime || isExpired(lastUpdateTime, lastServerUpdateTime)) {
                    if (updateStatus !== UpdateStatus.UPDATING) {
                        setUpdateStatus(UpdateStatus.UPDATING);
                    }
                    const previousData = JSON.parse(getFromLocalStorage('belcovid:' + key));
                    const url = lastFetchedIds[key]
                        ? `${API_URL}/${key}/${lastFetchedIds[key]}`
                        : `${API_URL}/${key}`;
                    const newDiff = await fetchData(url);
                    const data = diff.apply(newDiff.changes, previousData || {});
                    setIntoLocalStorage(`belcovid:${key}`, JSON.stringify(data));
                    setIntoLocalStorage(`belcovid:diffId:${key}`, newDiff.end[0]);
                    setIntoLocalStorage(`belcovid:update:${key}`, newDiff.end[1]);
                    newValues = {...newValues, [key]: data};
                    newUpdateDates = {...newUpdateDates, [key]: newDiff.end[1]};
                    setValues(newValues);
                    setUpdateDates(newUpdateDates);
                }
            }
            setUpdateStatus(UpdateStatus.DONE);
        };
        fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <StatsDataContext.Provider value={{...values, updateDates, updateStatus}}>
            {children}
        </StatsDataContext.Provider>
    );
}
