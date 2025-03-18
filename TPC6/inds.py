import json

with open("imdb_movies.json", "r", encoding="utf-8") as file:
    data = json.load(file)

rdf_output = ""

for id, name in data['allPeople'].items():
    rdf_output += f"""
###  http://github.com/ruippgoncalves/rpcw2025/cinema/{id}
:{id} rdf:type owl:NamedIndividual ,
                        :Pessoa ;
               :name "{name}" .
"""

for id in data['allCountries']:
    rdf_output += f"""
###  http://github.com/ruippgoncalves/rpcw2025/cinema/{id}
:{id} rdf:type owl:NamedIndividual ,
                         :Pais .
"""

for id in data['allLanguages']:
    rdf_output += f"""
###  http://github.com/ruippgoncalves/rpcw2025/cinema/{id}
:{id} rdf:type owl:NamedIndividual ,
                  :Lingua .
"""

for id in data['allGenres']:
    rdf_output += f"""
###  http://github.com/ruippgoncalves/rpcw2025/cinema/{id}
:{id} rdf:type owl:NamedIndividual ,
                   :Genero .
"""

for movie in data['movies']:
    id = movie['id']
    genres = ','.join([f':{t}' for t in movie['genres']])
    originalLanguage = movie['originalLanguage']
    og = ''

    if originalLanguage:
        og = f':temLingua :{originalLanguage};'

    rdf_output += f"""
###  http://github.com/ruippgoncalves/rpcw2025/cinema/{id}
:{id} rdf:type owl:NamedIndividual ,
                   :Filme ;
          :temArgumento :Argumento{id} ;
          :temGenero {genres} ;
          {og}
          :temPaisOrigem :{movie["originalCountry"]} ;
          :data "{movie["releaseYear"]}" ;
          :duracao {movie["duration"]} .
"""

print(rdf_output)
