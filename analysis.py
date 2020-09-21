import urllib.request
import json
import matplotlib.pyplot as plt
from datetime import date, timedelta
import math

LINK_HOSPI = 'https://epistat.sciensano.be/Data/COVID19BE_HOSP.json'
LINK_TOTAL_TESTS = 'https://epistat.sciensano.be/Data/COVID19BE_tests.json'
LINK_CASES = 'https://epistat.sciensano.be/Data/COVID19BE_CASES_AGESEX.json'
AVAILABLE_BEDS = 61600

def getData(link):
    f = urllib.request.urlopen(link)
    data = f.read()
    return json.loads(data.decode('latin1'))

def plotDataByDate(link, yKey, yLabel = ''):
    x = []
    y = []
    for item in getData(link):
        date = item['DATE'][5:10]
        yData = item[yKey]
        if len(x) and date == x[-1]:
            y[-1] += new_in
        else:
            x.append(date)
            y.append(yData)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel(yLabel)
    plt.show()

def plotHospi():
    x = []
    y = []
    for item in getData(LINK_HOSPI):
        date = item['DATE'][5:10]
        new_in = item['NEW_IN']
        if len(x) and date == x[-1]:
            y[-1] += new_in
        else:
            x.append(date)
            y.append(new_in)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('Hospitalisation IN')
    plt.show()

def plotTests():
    x = []
    y = []
    total_yesterday = 0
    for item in getData(LINK_TOTAL_TESTS):
        date = item['DATE'][5:10]
        total_tests = item['TESTS_ALL']
        total_today = total_tests - total_yesterday
        if len(x) and date == x[-1]:
            y[-1] += total_today
        else:
            x.append(date)
            y.append(total_today)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('Tests')
    plt.show()

def plotCases():
    x = []
    y = []
    total_yesterday = 0
    for item in getData(LINK_CASES):
        if ('DATE' in item):
            date = item['DATE'][5:10]
            cases = item['CASES']
            if len(x) and date == x[-1]:
                y[-1] += cases
            else:
                x.append(date)
                y.append(cases)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('Cases')
    plt.show()

def plotHospiByTest():
    x = []
    y = []
    total_yesterday = 0
    hospiData = getData(LINK_HOSPI)
    for item in getData(LINK_TOTAL_TESTS):
        date = item['DATE'][5:10]
        total_tests = item['TESTS_ALL']
        tests_today = total_tests - total_yesterday
        if (tests_today != 0):
            hospi_today = sum([hospiItem['NEW_IN'] for hospiItem in hospiData if hospiItem['DATE'] == item['DATE']])
            x.append(date)
            y.append(hospi_today / tests_today)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('Cases per test')
    plt.show()

def plotCasesByTest():
    x = []
    y = []
    total_yesterday = 0
    casesData = getData(LINK_CASES)
    for item in getData(LINK_TOTAL_TESTS):
        date = item['DATE'][5:10]
        total_tests = item['TESTS_ALL']
        tests_today = total_tests - total_yesterday
        if (tests_today != 0):
            cases_today = sum([casesItem['CASES'] for casesItem in casesData if 'DATE' in casesItem and casesItem['DATE'] == item['DATE']])
            x.append(date)
            y.append(cases_today / tests_today)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('Cases per test')
    plt.show()

def plotPeopleInHospital():
    x = []
    y = []
    hospiData = getData(LINK_HOSPI)
    for item in hospiData:
        date = item['DATE'][5:10]
        total_hospi = item['TOTAL_IN']
        if len(x) and date == x[-1]:
            y[-1] += total_hospi
        else:
            x.append(date)
            y.append(total_hospi)
    plt.plot(x, y)
    plt.xlabel('Date')
    plt.ylabel('People in hospital')
    plt.show()

def daysToSaturation(dateToday = date.today() - timedelta(days=1)):
    hospiData = getData(LINK_HOSPI)
    today = dateToday.strftime("%Y-%m-%d")
    dateYesterday = dateToday - timedelta(days=1)
    yesterday = dateYesterday.strftime("%Y-%m-%d")
    hospi_today = sum([item['TOTAL_IN'] for item in hospiData if 'DATE' in item and item['DATE'] == today])
    hospi_yesterday = sum([item['TOTAL_IN'] for item in hospiData if 'DATE' in item and item['DATE'] == yesterday])
    change = hospi_today - hospi_yesterday
    if change == 0 or hospi_today == 0:
        return 0
    augmentation = change / hospi_yesterday
    return math.log(AVAILABLE_BEDS/hospi_today, 1 + augmentation)

def dateOfSaturation(dateToday = date.today() - timedelta(days=1)):
    return dateToday + timedelta(days=daysToSaturation(dateToday))

# plotHospi()
# plotTests()
# plotCases()
# plotHospiByTest()
# plotCasesByTest()
# plotPeopleInHospital()
# print(daysToSaturation())
print(dateOfSaturation())
