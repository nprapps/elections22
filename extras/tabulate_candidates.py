# process the results file to determine who won by adding several columns:
# winner - 1 if true, 0 if not
# vote_pct - number of votes this candidate won as a total of votes cast
# winner is *not official* just whoevers ahead
import csv

race_id_dict = {}
source_data_rows = []


county_name_file = "county_names.csv"
infile = 'apresults.csv'
outfile = 'apresults_tabulated.csv'

# hash the county names

county_name_dict = {}
with open(county_name_file, 'r') as countyfile: 
	county_reader = csv.DictReader(countyfile)
	for row in county_reader:
		county_name_dict[row['key']] = row['value']


headers = None
with open(infile, 'r') as infile: 
	reader = csv.DictReader(infile)
	for row in reader:
		source_data_rows.append(row)
		hash_key = row['raceID'] + "-" + row['reportingunitID']
		race_id_dict[hash_key] = 0
		if not headers:
			headers = list(row.keys())

headers = headers + ['winner', 'vote_pct', 'total_votes', 'county_name']
writer = csv.DictWriter(open(outfile, 'w'), headers, extrasaction='ignore')
writer.writeheader()


# sum the votes and store to race_id dict
for row in source_data_rows:
	hash_key = row['raceID'] + "-" + row['reportingunitID']
	race_id_dict[hash_key] += int(row['voteCount'])
	print("Total votes in race %s = %s " % (hash_key, race_id_dict[hash_key]))

# Finally, add the vote percent and whether it's a winner
for row in source_data_rows:
	hash_key = row['raceID'] + "-" + row['reportingunitID']
	total_votes = race_id_dict[hash_key]
	vote_pct = 100*int(row['voteCount'])/total_votes
	row['total_votes'] = total_votes
	row['vote_pct'] = vote_pct
	row['winner'] = 0
	row['county_name'] = county_name_dict[row['reportingunitID']]
	if vote_pct > 50:
		row['winner'] = 1

	writer.writerow(row)



