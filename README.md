# spareroom-bulkmessage
Bulk messages to SpareRoom users

`/flatmate/flatmates.pl` controls the search. By default, a search for "rooms wanted" in "Nottingham" performs a GET request to `/flatmate/flatmates.pl?search_id=224177086&`. What's happening here is _known_ search terms are automatically given a search ID, which is a synonymous request to the full-hand `/flatshare/search.pl?nmsq_mode=normal&action=search&flatshare_type=wanted&search=Nottingham`

The full search URL is built as follows:

```
/flatshare/search.pl
	?flatshare_type=offered
	&location_type=area
	&search={searchterm}
	&miles_from_max=0
	&showme_rooms=Y
	&showme_1beds=Y
	&showme_buddyup_properties=Y
	&min_rent=0
	&max_rent=123
	&per=pw
	&no_of_rooms=
	&min_term=0
	&max_term=0
	&available_search=N
	&day_avail=03
	&mon_avail=06
	&year_avail=2015
	&min_age_req=
	&max_age_req=
	&min_beds=
	&max_beds=
	&keyword=
	&searchtype=advanced
	&editing=
	&mode=
	&nmsq_mode=
	&action=search
	&templateoveride=
	&show_results=
	&submit=
```

What we use for this search:

```
/flatshare/search.pl
	?flatshare_type={offered|wanted|buddyup}
	&location_type=area
	&search={searchterm}
	&miles_from_max={miles}
	&showme_rooms=Y
	&showme_1beds=Y
	&showme_buddyup_properties=Y
	&min_rent={mincost}
	&max_rent={maxcost}
	&per=pcm
	&no_of_rooms=
	&min_term=0
	&max_term=0
	&available_search=N
	&day_avail=
	&mon_avail=
	&year_avail=
	&min_age_req=
	&max_age_req=
	&min_beds=
	&max_beds=
	&keyword=
	&searchtype=advanced
	&editing=
	&mode=
	&nmsq_mode=
	&action=search
	&templateoveride=
	&show_results=
	&submit=
```

Extra options:

```
	&rooms_for=couples			#couples/females/males
	&genderfilter=none			#none/mixed/males/females
	&room_types=single			#single/double/[empty value]
	&keyword=					#[plaintext, url encoded]
	&ensuite=Y
	&smoking=N
	&parking=Y
	
	&photoadsonly=Y
	&short_lets_considered=Y
	&dss=Y						#DSS OK
	&disabled_access=Y
	&vegetarians=Y
	&no_of_rooms=				#1/2/3 (3 = 3+)
	&pets_req=Y
```

http://www.spareroom.co.uk/flatshare/search.pl?flatshare_type={offered|wanted|buddyup}&location_type=area&search={searchterm}&miles_from_max={miles}&showme_rooms=Y&showme_1beds=Y&showme_buddyup_properties=Y&min_rent={mincost}&max_rent={maxcost}&per=pcm&no_of_rooms=&min_term=0&max_term=0&available_search=N&day_avail=&mon_avail=&year_avail=&min_age_req=&max_age_req=&min_beds=&max_beds=&keyword=&searchtype=advanced%20&editing=&mode=&nmsq_mode=&action=search&templateoveride=&show_results=&submit=
