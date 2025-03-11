import json
import requests


def query_sparql(endpoint_url, sparql_query):
    headers = {
        'Accept': 'application/json',
    }

    response = requests.get(endpoint_url, params={'query': sparql_query}, headers=headers)

    if response.status_code > 300:
        raise Exception(f"Error {response.status_code}: {response.text}")

    response = response.json()
    variables = response['head']['vars']
    result = []

    for bind in response['results']['bindings']:
        obj = {}

        for var in variables:
            if var in bind:
                obj[var] = bind[var]['value']

        result.append(obj)

    return result

endpoint = "https://dbpedia.org/sparql"

movies = query_sparql(endpoint, f'''
select distinct ?id ?title ?origin ?producer ?abstract where {{
    ?id a schema:Movie .
    # release date
    ?id dbp:name ?title .
    filter(lang(?title)="en")
    ?id dbp:country ?origin .
    filter(lang(?origin)="en")
    ?id dbo:producer/dbp:name ?producer .
    filter(lang(?producer)="en")
    ?id dbo:abstract ?abstract .
    filter(lang(?abstract)="en")
}} ORDER BY RAND() LIMIT 100
''')

dataset = {
    'actors': {},
    #'genres': {},
    'movies': movies
}

for movie in movies:
    movie_id = movie['id']
    print('movie', movie_id)
    starring = query_sparql(endpoint, f'''
select ?starring where {{
    <{movie_id}> dbo:starring ?starring .
}} LIMIT 5
''')
    starring = list(map(lambda s: s['starring'], starring))
    movie['starring'] = starring

    for star in starring:
        if star not in dataset['actors']:
            print('star', star)
            data = query_sparql(endpoint, f'''
select ?name ?birthDate ?origin where {{
    <{star}> dbp:name ?name .
    filter(lang(?name)="en")
    <{star}> dbo:birthDate ?birthDate .
    <{star}> dbp:birthPlace ?origin .
    #filter(lang(?origin)="en")
}}
''')
            if len(data) > 0:
                data = data[0]
                data['id'] = star
                dataset['actors'][star] = data


with open('dataset.json', 'w') as fout:
    json.dump(dataset, fout, ensure_ascii=False)
