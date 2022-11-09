import requests, csv, json, datetime
from requests.exceptions import HTTPError
from api_key import api_key

returnformat = "json"
offices = "G,S,H,I"
resultslevel = "FIPSCode"


timestamp = str(datetime.datetime.now()).replace(" ", "_")
params_arg = offices + "=" + resultslevel + "=" 


parsedresultsfile = 'apresults.csv'
result = None
raw_url = "https://api.ap.org/v3/elections/2022-11-08?&level=%s&format=json&apikey=%s&officeID=%s" % (resultslevel, api_key, offices)


print("Retrieving from %s and writing output to %s" % (raw_url, parsedresultsfile))

fieldnames = ['eventID', 'stateID', 'test', 'resultsType', 'raceID', 'raceType', 'raceTypeID', 'tabulationStatus', 'raceCallStatus', 'officeID', 'officeName', 'incumbents', 'eevp', 'national', 'state', 'description', 'seatNum', 'seatName']
# reporting units
RU_keys = [ 'statePostal',  'stateName',  'reportingunitID',  'reportingunitLevel',  'pollClosingTime',  'level',  'electTotal',  'lastUpdated',  'precinctsReporting',  'eevp',  'precinctsTotal',  'precinctsReportingPct']
# candidates
cand_keys = ['first',  'last',  'party',  'candidateID',  'polID',  'ballotOrder',  'polNum',  'voteCount',  'electWon']

fieldnames = fieldnames + RU_keys + cand_keys
csvfile = open(parsedresultsfile, 'w')
resultwriter = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
resultwriter.writeheader()

result = None

try:
    response = requests.get(raw_url)
    response.raise_for_status()
    result = response.json()

except HTTPError as http_err:
    print(f'HTTP error occurred: {http_err}')
except Exception as err:
    print(f'Other error occurred: {err}')

print("result timestamp is %s" % result["timestamp"])

races = result["races"]
for race in races:
    
    reportingunits = race['reportingUnits']
    for RU in reportingunits:
        for key in RU_keys:
            try:
                race[key] = RU[key]
            except KeyError:
                pass
        
        candidates = RU['candidates']
        for candidate in candidates:
            for key in cand_keys:
                try:
                    race[key] = candidate[key]
                except KeyError:
                    pass

            resultwriter.writerow(race)

