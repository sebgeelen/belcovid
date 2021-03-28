import React from 'react';
import { AGE_GROUPS_CASES, AGE_GROUPS_MORTALITY, fetchStatsData, provinceKey, PROVINCES } from '../data/data';
import { getDaysBetween, getFromLocalStorage, objectFrom, setIntoLocalStorage, today } from '../helpers';

export const StatsDataContext = React.createContext({});

export function StatsDataContextProvider({children}) {
    const [cases, setCases] = React.useState();
    const [totalHospitalizations, setTotalHospitalizations] = React.useState();
    const [newHospitalizations, setNewHospitalizations] = React.useState();
    const [totalICU, setTotalICU] = React.useState();
    const [mortality, setMortality] = React.useState();
    const [tests, setTests] = React.useState();

    React.useMemo(() => {
        const lastSaveStats = getFromLocalStorage('belcovid:update:stats');

        const setData = (setter, data, localStorageKey) => {
            setter(data);
            setIntoLocalStorage(localStorageKey, JSON.stringify(data));
        };
        const normalizeData = (dataKey, values, ageGroups) => {
            const data = objectFrom(Object.keys(PROVINCES), {});
            for (const item of values) {
                const province = (item.PROVINCE && provinceKey(item.PROVINCE)) || 'be';
                const date = item.DATE;
                if (!date) continue;

                const value = +item[dataKey];
                if (ageGroups) {
                    const ageGroup = item.AGEGROUP || 'Age unknown';
                    if (!data[province][date]) {
                        // Initialize the age group values.
                        data[province][date] = objectFrom(ageGroups, 0);
                    }
                    if (!data.be[date]) {
                        // Initialize the age group values for Belgium.
                        data.be[date] = objectFrom(ageGroups, 0);
                    }
                    const normalizedValue = data[province][date][ageGroup] || 0;
                    // Set province value at date for age group.
                    data[province][date][ageGroup] = normalizedValue + value;
                    // Add to total for province at date.
                    const totalValue = data[province][date].total || 0;
                    data[province][date].total = totalValue + value;
                    // Add to totals for Belgium at date.
                    if (province !== 'be') {
                        if (!data.be[date]) {
                            data.be[date] = {};
                        }
                        // Add to total for Belgium at date for age group.
                        const belgiumValue = data.be[date][ageGroup] || 0;
                        data.be[date][ageGroup] = belgiumValue + value;
                        // Add to total for Belgium at date.
                        const belgiumTotal = data.be[date].total || 0;
                        data.be[date].total = belgiumTotal + value;
                    }
                } else {
                    const provinceValue = data[province][date] || 0;
                    // Set province value at date.
                    data[province][date] = provinceValue + value;
                    // Add to total for Belgium at date.
                    if (province !== 'be') {
                        const belgiumValue = data.be[date] || 0;
                        data.be[date] = belgiumValue + value;
                    }
                }
            }
            return data;
        };
        const updateStats = () => {
            const dataPromises = fetchStatsData();
            for (const dataPromise of dataPromises) {
                dataPromise.then(([key, values]) => {
                    const localStorageKey = `belcovid:${key}`;
                    switch (key) {
                        case 'cases': {
                            setData(
                                setCases,
                                normalizeData('CASES', values, AGE_GROUPS_CASES),
                                localStorageKey,
                            );
                            break;
                        }
                        case 'hospitalizations': {
                            setData(
                                setTotalHospitalizations,
                                normalizeData('TOTAL_IN', values),
                                'belcovid:totalHospitalizations',
                            );
                            setData(
                                setNewHospitalizations,
                                normalizeData('NEW_IN', values),
                                'belcovid:newHospitalizations',
                            );
                            setData(
                                setTotalICU,
                                normalizeData('TOTAL_IN_ICU', values),
                                'belcovid:totalICU',
                            );
                            break;
                        }
                        case 'mortality': {
                            setData(
                                setMortality,
                                normalizeData('DEATHS', values, AGE_GROUPS_MORTALITY),
                                localStorageKey,
                            );
                            break;
                        }
                        case 'tests': {
                            setData(
                                setTests,
                                normalizeData('TESTS_ALL', values, AGE_GROUPS_MORTALITY),
                                localStorageKey,
                            );
                            break;
                        }
                        default: return;
                    }
                });
            }
            Promise.all(dataPromises).then(() => {
                setIntoLocalStorage('belcovid:update:stats', new Date().toISOString());
            });
        }
        // Update stats data.
        if (lastSaveStats) {
            const lastSaveDate = new Date(lastSaveStats);
            const lastSaveHours = (lastSaveDate.getTime() - today().getTime()) / (1000 * 60 * 60);
            const areStatsExpired = getDaysBetween(lastSaveDate, today()) !== 0 || lastSaveHours >= 12;
            if (areStatsExpired) {
                // Data are too old: update.
                // eslint-disable-next-line no-console
                console.log('epidemiological data expired. Updating...');
                updateStats();
            } else {
                let areStatsMissing = false;
                for (const [key, setter] of [
                    ['cases', setCases],
                    ['totalHospitalizations', setTotalHospitalizations],
                    ['newHospitalizations', setNewHospitalizations],
                    ['totalICU', setTotalICU],
                    ['mortality', setMortality],
                    ['tests', setTests],
                ]) {
                    const statsData = getFromLocalStorage('belcovid:' + key);
                    if (statsData) {
                        setter(JSON.parse(statsData));
                    } else {
                        // Some stats are missing: update.
                        areStatsMissing = true;
                        break;
                    }
                }
                if (areStatsMissing) {
                    // eslint-disable-next-line no-console
                    console.log('Some epidemiological data was not saved properly. Updating...');
                    updateStats();
                }
            }
        } else {
            // eslint-disable-next-line no-console
            console.log('Fetching epidemiological data for the first time...');
            updateStats();
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
