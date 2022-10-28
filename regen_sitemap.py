from datetime import date

todayobj = date.today()
todays_datestring = "%s-%s-%s" % (todayobj.year, todayobj.month, todayobj.day)

datestring = todays_datestring
# datestring = "2021-01-09"

url_base = "https://apps.npr.org/election-results-live-2022/"

states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']

paths = ["", "#/house", "#/senate", "#/governor", "#/president", ]

state_paths = ['', '/key', '/S', '/H','/I', '/G']

header = """<?xml version="1.0" encoding="UTF-8"?>"""
urlset_start = """<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">"""
urlset_end = """</urlset>\n"""
url_frag = """\t<url>\n\t\t<loc>%s</loc>\n\t\t<lastmod>%s</lastmod>\n\t\t<changefreq>daily</changefreq>\n\t</url>"""


url_count = 0

outfile = open("sitemap.xml", 'w')
outfile.write(header + "\n")
outfile.write(urlset_start + "\n")

for path in paths:
	this_url = url_base+path
	print(this_url)
	this_sitemap_url = url_frag % (this_url, datestring)
	outfile.write( this_sitemap_url + "\n")
	url_count += 1

for state in states:
	for suffix in state_paths:
		this_url = url_base + "#/states/" + state + suffix
		print(this_url)
		this_sitemap_url = url_frag % (this_url, datestring)
		outfile.write( this_sitemap_url + "\n")
		url_count += 1


outfile.write(urlset_end)

print("Wrote a total of %s urls" % url_count)
