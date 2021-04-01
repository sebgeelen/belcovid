import React from 'react';
import diff from 'changeset';
import { fetchData, PROXY } from '../data/data';
import { getDaysBetween, getFromLocalStorage, setIntoLocalStorage, today } from '../helpers';

const API_URL = `${PROXY}https://belcovid-db.herokuapp.com`;

export const StatsDataContext = React.createContext({});

export function StatsDataContextProvider({children}) {
    const [cases, setCases] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:cases'))
    );
    const [totalHospitalizations, setTotalHospitalizations] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:totalHospitalizations'))
    );
    const [newHospitalizations, setNewHospitalizations] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:newHospitalizations'))
    );
    const [totalICU, setTotalICU] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:totalICU'))
    );
    const [mortality, setMortality] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:mortality'))
    );
    const [tests, setTests] = React.useState(
        JSON.parse(getFromLocalStorage('belcovid:tests'))
    );

    React.useMemo(() => {
        const lastSaveStats = getFromLocalStorage('belcovid:update:stats');
        let areStatsExpired = false;
        if (lastSaveStats) {
            const lastSaveDate = new Date(lastSaveStats);
            const lastSaveHours = (new Date().getTime() - lastSaveDate.getTime()) / (1000 * 60 * 60);
            areStatsExpired = getDaysBetween(lastSaveDate, today()) !== 0 || lastSaveHours >= 12;
        }
        const lastFetchedIds = {
            cases: getFromLocalStorage('belcovid:diffId:cases'),
            totalHospitalizations: getFromLocalStorage('belcovid:diffId:totalHospitalizations'),
            newHospitalizations: getFromLocalStorage('belcovid:diffId:newHospitalizations'),
            totalICU: getFromLocalStorage('belcovid:diffId:totalICU'),
            mortality: getFromLocalStorage('belcovid:diffId:mortality'),
            tests: getFromLocalStorage('belcovid:diffId:tests'),
        };

        const setterMap = {
            cases: setCases,
            totalHospitalizations: setTotalHospitalizations,
            newHospitalizations: setNewHospitalizations,
            totalICU: setTotalICU,
            mortality: setMortality,
            tests: setTests,
        };
        // Update stats data.
        if (!lastSaveStats || areStatsExpired) {
            for (const key of Object.keys(setterMap)) {
                const previousData = JSON.parse(getFromLocalStorage('belcovid:' + key));
                const url = lastFetchedIds[key]
                    ? `${API_URL}/${key}/${lastFetchedIds[key]}`
                    : `${API_URL}/${key}`;
                fetchData(url).then(newDiff => {
                    const data = diff.apply(newDiff.changes, previousData || {});
                    setIntoLocalStorage(`belcovid:${key}`, JSON.stringify(data));
                    setIntoLocalStorage(`belcovid:diffId:${key}`, newDiff.end);
                    setterMap[key](data);
                });
            }
            setIntoLocalStorage('belcovid:update:stats', new Date().toISOString());
        }
    }, []);
    return (
        <StatsDataContext.Provider value={{
            cases, totalHospitalizations, newHospitalizations, totalICU, mortality, tests
        }}>
            {children}
        </StatsDataContext.Provider>
    );
}
