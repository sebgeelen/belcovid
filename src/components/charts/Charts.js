import React, { useContext, useState } from 'react';
import Title from '../Title';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Skeleton from '@material-ui/lab/Skeleton';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import withStyles from '@material-ui/core/styles/withStyles';
import { AGE_GROUPS_CASES, AGE_GROUPS_MORTALITY, getIncidenceData, provinceString } from '../../data/data';
import { testingAnnotations, lastConsolidatedDataDay } from '../../helpers';
import { Route, Switch } from 'react-router-dom';
import { StatsDataContext } from '../../contexts/StatsDataContext';
import { styles } from '../../styles';
const ChartByAge = React.lazy(() => import('./ChartByAge'));
const AveragedData = React.lazy(() => import('./AveragedData'));
const RateOfChange = React.lazy(() => import('./RateOfChange'));

export const dataInfo = {
    cases: {
        average: {
            title: 'New cases, by age group (7-day rolling average)',
            annotations: testingAnnotations,
            ageGroups: AGE_GROUPS_CASES,
            stacked: true,
            labelStrings: {
                y: 'new cases',
            },
        },
        change: {
            title: 'Week by week change of new cases',
            description: (
                <React.Fragment>
                    How fast is the number of cases rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of new cases between the last 7 days
                        and the 7 days before that).</i>
                </React.Fragment>
            ),
            annotations: testingAnnotations,
        },
    },
    incidence: {
        description: (
            <React.Fragment>Population data
                from <Link href={'https://statbel.fgov.be/en/open-data/' +
                    'population-place-residence-nationality-marital-status-' +
                    'age-and-sex-10'} target="_blank">
                    StatBel, 2019
                </Link>.
            </React.Fragment>
        ),
        average: {
            title: 'Incidence, by age group',
            annotations: testingAnnotations,
            ageGroups: (() => {
                const groups = [...AGE_GROUPS_CASES];
                groups.pop();
                groups.push('total');
                return groups;
            })(),
            stacked: false,
            labelStrings: {
                y: 'cases / 100k',
            },
        },
        change: {
            title: 'Week by week change of incidence',
            description: (
                <React.Fragment>
                    How fast is the incidence rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of new cases between the last 7 days
                        and the 7 days before that).</i>
                </React.Fragment>
            ),
            annotations: testingAnnotations,
        },
    },
    hospitalizations: {
        description: 'This concerns the number of patients that are hospitalized on a given day, not only the new admissions.',
        average: {
            title: 'Patients at the hospital',
            labelStrings: {
                y: 'total hospital patients',
            },
        },
        change: {
            title: 'Week by week change of hospitalized patients',
            description: (
                <React.Fragment>
                    How fast is the number of patients at the hospital rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of patients at the hospital between the last
                        7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    icu: {
        description: 'This concerns the number of patients that are in intensive care on a given day, not only the new admissions.',
        average: {
            title: 'Patients in intensive care',
            labelStrings: {
                y: 'total ICU patients',
            },
        },
        change: {
            title: 'Week by week change of patients in intensive care',
            description: (
                <React.Fragment>
                    How fast is the number of patients in ICU rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of patients in intensive care between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    mortality: {
        average: {
            title: 'Mortality, by age group (7-day rolling average)',
            ageGroups: AGE_GROUPS_MORTALITY,
            stacked: true,
            labelStrings: {
                y: 'new deaths',
            },
        },
        change: {
            title: 'Week by week change of mortality',
            description: (
                <React.Fragment>
                    How fast is the mortality rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of mortality between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
    tests: {
        average: {
            title: 'Tests administered (7-day rolling average)',
            labelStrings: {
                y: 'new tests',
            },
        },
        change: {
            title: 'Week by week change of testing',
            description: (
                <React.Fragment>
                    How fast is the testing rising/falling (in %) ?<br/>
                    <i>(The percentage change in number of tests between the
                        last 7 days and the 7 days before that).</i>
                </React.Fragment>
            ),
        },
    },
};
const compareOrder = ['tests', 'cases', 'hospitalizations', 'icu', 'mortality'];
const getSearchParams = () => {
    return window.location.search.replace('?', '');
};

function Charts({ province, classes }) {
    const context = useContext(StatsDataContext);
    const cases = context.cases?.[province];
    const newHospitalizations = context.newHospitalizations?.[province];
    const totalHospitalizations = context.totalHospitalizations?.[province];
    const totalICU = context.totalICU?.[province];
    const mortality = context.mortality?.[province];
    const tests = context.tests?.[province];

    const urlParams = React.useMemo(() => new URLSearchParams(getSearchParams()), []);
    const [variable1, setVariable1] = useState(urlParams.get('var1') || 'cases');
    const [variable2, setVariable2] = useState(urlParams.get('var2') || '');
    const [chartType, setChartType] = useState(urlParams.get('chartType') || 'average');
    const [incidenceDays, setIncidenceDays] = useState(+urlParams.get('incDays') || 14);
    const [incidenceDenominator, setIncidenceDenominator] = useState(+urlParams.get('incDen') || 100000);

    React.useEffect(() => {
        if (['incidence', 'icu', variable2].includes(variable1)) {
            setVariable2('');
        }
        urlParams.set('var1', variable1);
        variable2 ? urlParams.set('var2', variable2) : urlParams.delete('var2');
        chartType ? urlParams.set('chartType', chartType) : urlParams.delete('chartType');
        if ('?' + urlParams.toString() !== window.location.search) {
            const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash.replace(/\?.*$/, '')}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
    }, [variable1, variable2, chartType, urlParams]);

    const getData = variableName => {
        switch (variableName) {
            case 'cases': {
                return cases;
            }
            case 'hospitalizations': {
                return variable2 ? newHospitalizations : totalHospitalizations;
            }
            case 'icu':
                return totalICU;
            case 'incidence':
                return getIncidenceData(
                    cases,
                    province,
                    incidenceDays,
                    incidenceDenominator,
                );
            case 'mortality':
                return mortality;
            case 'tests':
                return tests;
            default:
                return null;
        }
    };
    const getChart = () => {
        const variableInfo = dataInfo[variable1];
        if (!variableInfo) return;
        const chartInfo = variableInfo[chartType];
        if (!chartInfo) return;
        const data = getData(variable1);
        if (!data) {
            return <Skeleton variant="rect" height={200} />;
        }
        let chart;
        let title = chartInfo.title;
        if (variable2) {
            const data2 = getData(variable2);
            const comparedData = {};
            let currentValues1 = [];
            let currentValues2 = [];
            const mustReverse = compareOrder.indexOf(variable1) > compareOrder.indexOf(variable2);
            for (const date of Object.keys(data)) {
                currentValues1.push(typeof data[date] === 'object'
                    ? data[date].total
                    : data[date]);
                const today2 = data2[date];
                currentValues2.push(today2
                    ? (
                        typeof today2 === 'object'
                            ? today2.total
                            : today2
                        )
                    : 0);
                if (currentValues1.length > 7) currentValues1.shift();
                if (currentValues2.length > 7) currentValues2.shift();
                const currentTotal1 = currentValues1.reduce((a, b) => a + b);
                const currentTotal2 = currentValues2.reduce((a, b) => a + b);
                comparedData[date] = 100 * (mustReverse
                    ? currentTotal1 / currentTotal2
                    : currentTotal2 / currentTotal1);
            }
            title = `Cumulative (over 7 days) ${mustReverse ? variable1 : variable2} / cumulative ${mustReverse
                ? variable2
                : variable1}`;
            const labelStrings = {
                y: `total ${mustReverse ? variable1 : variable2} / total ${mustReverse
                    ? variable2
                    : variable1} (in %)`,
            };
            switch (chartType) {
                case 'average':
                    chart = (
                        <AveragedData
                            data={comparedData}
                            chartName={title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            labelStrings={labelStrings}
                            noAverage={true}
                            max={lastConsolidatedDataDay()}
                        />
                    );
                    break;
                case 'change':
                    chart = (
                        <RateOfChange
                            data={comparedData}
                            chartName={title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            labelStrings={labelStrings}
                            max={lastConsolidatedDataDay()}
                        />
                    );
                    break;
                default: break;
            }
        } else {
            switch (chartType) {
                case 'average': {
                    if (chartInfo.ageGroups) {
                        let labelStrings = chartInfo.labelStrings;
                        if (variable1 === 'incidence') {
                            labelStrings = {
                                y: `cases / ${
                                    incidenceDenominator === 100 ?
                                        100 + 'inhabitants' :
                                        (incidenceDenominator / 1000) + 'k'
                                    }`,
                            };
                        }
                        chart = (
                            <ChartByAge
                                data={data}
                                annotations={chartInfo.annotations}
                                chartName={chartInfo.title}
                                asImage={true}
                                ageGroups={chartInfo.ageGroups}
                                stacked={chartInfo.stacked}
                                ticksCallbacks={chartInfo.ticksCallbacks}
                                labelStrings={labelStrings}
                                max={variable1 !== 'incidence' && lastConsolidatedDataDay()}
                            />
                        );
                    } else {
                        chart = (
                            <AveragedData
                                data={data}
                                chartName={chartInfo.title}
                                annotations={chartInfo.annotations}
                                asImage={true}
                                labelStrings={chartInfo.labelStrings}
                                max={lastConsolidatedDataDay()}
                            />
                        );
                    }
                    break;
                }
                case 'change': {
                    chart = (
                        <RateOfChange
                            data={data}
                            chartName={chartInfo.title}
                            annotations={chartInfo.annotations}
                            asImage={true}
                            max={variable1 !== 'incidence' && lastConsolidatedDataDay()}
                        />
                    );
                    break;
                }
                default: break;
            }
        }
        if (!variable2 && variable1 === 'incidence' && chartType === 'average') {
            title += ` (${incidenceDays} days, `;
            if (incidenceDenominator === 100) {
                title += 'in %)';
            } else {
                title += `per ${incidenceDenominator / 1000}k inhabitants)`;
            }
        }
        return (
            <React.Suspense fallback={<Skeleton variant="rect" height={200} />}>
                <div style={{ marginTop: 20 }} />
                <Box display={{xs: 'none', sm: 'block'}}>
                    <Divider variant="middle" />
                    <div style={{ marginTop: 20 }} />
                </Box>
                <Title id="icu">{title}</Title>
                {
                    !variable2 && variableInfo.description &&
                    <p><small>{variableInfo.description}</small></p>
                }
                {
                    !variable2 && chartInfo.description &&
                    <p><small>{chartInfo.description}</small></p>
                }

                <div className={classes.chartSection}>
                    { chart }
                </div>

                {
                    variable1 === 'incidence' &&
                    <Container style={{ marginTop: 15, maxWidth: 500 }}>
                        <Slider
                            defaultValue={14}
                            getAriaValueText={value => `${value} days`}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            step={7}
                            marks={[
                                {
                                    value: 7,
                                    label: '7 days',
                                },
                                {
                                    value: 14,
                                    label: '14 days',
                                },
                            ]}
                            min={7}
                            max={14}
                            onChange={(ev, value) => setIncidenceDays(value)}
                        />
                        {
                            chartType === 'average' &&
                            <Slider
                                defaultValue={100000}
                                getAriaValueText={value => {
                                    if (value === 100) return '%';
                                    return `/${value / 1000}k`;
                                }}
                                valueLabelFormat={value => {
                                    if (value === 100) return '%';
                                    return `/${value / 1000}k`;
                                }}
                                aria-labelledby="discrete-slider"
                                valueLabelDisplay="auto"
                                step={null}
                                marks={[
                                    {
                                        value: 100,
                                        label: '%',
                                    },
                                    {
                                        value: 10000,
                                        label: '/10k',
                                    },
                                    {
                                        value: 50000,
                                        label: '/50k',
                                    },
                                    {
                                        value: 100000,
                                        label: '/100k',
                                    },
                                ]}
                                min={100}
                                max={100000}
                                onChange={(ev, value) => setIncidenceDenominator(value)}
                            />
                        }
                    </Container>
                }
            </React.Suspense>
        );
    };

    return (
        <React.Fragment>
            <Title>Charts for {provinceString(province)}</Title>
            <Box display={{xs: 'none', sm: 'block'}}>
                <FormControl component="fieldset" className={classes.formControl} style={{width: "100%"}}>
                    <Grid container spacing={4} justify="center">
                        <Grid item xs>
                            <FormLabel component="legend">Variable</FormLabel>
                            <RadioGroup
                                value={variable1}
                                onChange={ev => setVariable1(ev.target.value)}
                            >
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="cases"
                                    label="Cases" />
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="incidence"
                                    label="Incidence"
                                />
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="hospitalizations"
                                    label="Hospitalizations"
                                />
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="icu"
                                    label="Intensive Care"
                                />
                                <Tooltip title="Mortality data cannot be filtered per province.">
                                    <FormControlLabel
                                        control={<Radio/>}
                                        value="mortality"
                                        label="Mortality"
                                        disabled={province !== 'be'}
                                    />
                                </Tooltip>
                                <Tooltip title="Testing data cannot be filtered per province.">
                                    <FormControlLabel
                                        control={<Radio/>}
                                        value="tests"
                                        label="Tests"
                                        disabled={province !== 'be'}
                                    />
                                </Tooltip>
                            </RadioGroup>
                        </Grid>
                        {
                            !['incidence', 'icu'].includes(variable1) &&
                            <Grid item xs>
                                <FormLabel component="legend">Compare with</FormLabel>
                                <RadioGroup
                                    value={variable2}
                                    onChange={(ev) => setVariable2(ev.target.value)}
                                >
                                    <FormControlLabel
                                        control={<Radio/>}
                                        value={''}
                                        label="None" />
                                    <FormControlLabel
                                        control={<Radio/>}
                                        disabled={['cases', 'incidence', 'icu'].includes(variable1)}
                                        value="cases"
                                        label="Cases" />
                                    <FormControlLabel
                                        control={<Radio/>}
                                        disabled={['incidence', 'hospitalizations', 'icu'].includes(variable1)}
                                        value="hospitalizations"
                                        label="Hospitalizations"
                                    />
                                    <FormControlLabel
                                        control={<Radio/>}
                                        disabled={['incidence', 'icu'].includes(variable1)}
                                        value="icu"
                                        label="Intensive Care"
                                    />
                                    <Tooltip title="Mortality data cannot be filtered per province.">
                                        <FormControlLabel
                                            control={<Radio/>}
                                            disabled={province !== 'be' || ['incidence', 'mortality', 'icu'].includes(variable1)}
                                            value="mortality"
                                            label="Mortality"
                                        />
                                    </Tooltip>
                                    <Tooltip title="Testing data cannot be filtered per province.">
                                        <FormControlLabel
                                            control={<Radio/>}
                                            disabled={province !== 'be' || ['tests', 'incidence', 'icu'].includes(variable1)}
                                            value="tests"
                                            label="Tests"
                                        />
                                    </Tooltip>
                                </RadioGroup>
                            </Grid>
                        }
                        <Grid item xs>
                            <FormLabel component="legend">Chart type</FormLabel>
                            <RadioGroup
                                value={chartType}
                                onChange={ (ev) => setChartType(ev.target.value) }
                            >
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="average"
                                    label={variable2 ? 'Ratio' : 'Rolling average'}
                                />
                                <FormControlLabel
                                    control={<Radio/>}
                                    value="change"
                                    label="Rate of change"
                                />
                            </RadioGroup>
                        </Grid>
                    </Grid>
                </FormControl>
            </Box>
            <Box display={{xs: 'block', sm: 'none'}}>
                <FormControl className={classes.formControl}>
                    <InputLabel shrink id="variable1-select-label">
                        Variable
                    </InputLabel>
                    <Select
                        labelId="variable1-select-label"
                        id="variable1-select"
                        value={variable1}
                        onChange={ev => setVariable1(ev.target.value)}
                        displayEmpty
                        className={classes.selectEmpty}
                    >
                        <MenuItem value='cases'>Cases</MenuItem>
                        <MenuItem value='incidence'>Incidence</MenuItem>
                        <MenuItem value='hospitalizations'>Hospitalizations</MenuItem>
                        <MenuItem value='icu'>Intensive Care</MenuItem>
                        <MenuItem value='mortality'>Mortality</MenuItem>
                        <MenuItem value='tests'>Tests</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    {
                        !['incidence', 'icu'].includes(variable1) &&
                        <React.Fragment>
                            <InputLabel shrink id="variable2-select-label">
                                Compare with
                            </InputLabel>
                            <Select
                                labelId="variable2-select-label"
                                id="variable2-select"
                                value={variable2}
                                onChange={ev => setVariable2(ev.target.value)}
                                displayEmpty
                                className={classes.selectEmpty}
                            >
                                <MenuItem value=''>None</MenuItem>
                                <MenuItem
                                    value='cases'
                                    disabled={['cases', 'incidence', 'icu'].includes(variable1)}>
                                    Cases
                                </MenuItem>
                                <MenuItem
                                    value='hospitalizations'
                                    disabled={['incidence', 'hospitalizations', 'icu'].includes(variable1)}>
                                    Hospitalizations
                                </MenuItem>
                                <MenuItem
                                    value='icu'
                                    disabled={['incidence', 'icu'].includes(variable1)}>
                                    Intensive Care
                                </MenuItem>
                                <MenuItem 
                                    value='mortality'
                                    disabled={province !== 'be' || ['incidence', 'mortality', 'icu'].includes(variable1)}>
                                    Mortality
                                </MenuItem>
                                <MenuItem value='tests'
                                    disabled={province !== 'be' || ['tests', 'incidence', 'icu'].includes(variable1)}>
                                    Tests
                                </MenuItem>
                            </Select>
                        </React.Fragment>
                    }
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel shrink id="chart-type-select-label">
                        Chart type
                    </InputLabel>
                    <Select
                        labelId="chart-type-select-label"
                        id="chart-type-select"
                        value={chartType}
                        onChange={ev => setChartType(ev.target.value)}
                        displayEmpty
                        className={classes.selectEmpty}
                    >
                        <MenuItem value='average'>
                            {variable2 ? 'Ratio' : 'Rolling average'}
                        </MenuItem>
                        <MenuItem value='change'>Rate of change</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <section id="chart">
                <Switch>
                    <Route path="/charts">
                        {getChart}
                    </Route>
                </Switch>
            </section>
        </React.Fragment>
    );
}

export default withStyles(styles)(Charts);
