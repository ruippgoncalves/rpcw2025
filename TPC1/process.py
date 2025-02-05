# Pessoa
# - id d
# - primeiroNome d
# - ultimoNome d
# - idade d
# - genero d
# - morada o
# - email d
# Localidade
# - nome d
# Modalidade
# - nome d
# Clube
# - nome d
# Pratica
# - pessoa o
# - modalidade o
# - federado d
# - clube o
# Exame
# - pessoa o
# - data d
# - resultado d

import json

file = open('emd.json', 'r', encoding='utf-8')
data = json.load(file)

#print(len(data))

if True:
    modalidades = set()

    for pessoa in data:
        modalidades.add(pessoa['modalidade'])

    #print(len(modalidades))

    for modalidade in modalidades:
        print(f'''###  http://github.com/ruippgoncalves/rpcw2025/TPC1/{modalidade}
:{modalidade} rdf:type owl:NamedIndividual ,
                    :Modalidade ;
           :nome "{modalidade}" .

''')

if True:
    localidades = set()

    for pessoa in data:
        localidades.add(pessoa["morada"])

    # print(len(localidades))

    for localidade in localidades:
        print(f'''###  http://github.com/ruippgoncalves/rpcw2025/TPC1/{localidade}
:{localidade} rdf:type owl:NamedIndividual ,
               :Localidade ;
      :nome "{localidade}" .

''')

if True:
    clubes = set()

    for pessoa in data:
        clubes.add(pessoa["clube"])

    # print(len(clubes))

    for clube in clubes:
        clubeName = clube.replace(' ', '-')
        print(f'''###  http://github.com/ruippgoncalves/rpcw2025/TPC1/{clubeName}
:{clubeName} rdf:type owl:NamedIndividual ,
                 :Clube ;
        :nome "{clube}" .

''')

if True:
    #pessoas = set()
    #
    #for pessoa in data:
    #   pessoas.add(f'{pessoa["nome"]["primeiro"]}{pessoa["nome"]["último"]}')
    #
    #print(len(pessoas))

    for pessoa in data:
        name = f'{pessoa["nome"]["primeiro"]}{pessoa["nome"]["último"]}'
        print(f''':{name} rdf:type owl:NamedIndividual ,
                       :Pessoa ;
              :mora :{pessoa["morada"]} ;
              :email "{pessoa["email"]}" ;
              :generoMasculino "{"true" if pessoa["género"] == "M" else "false"}"^^xsd:boolean ;
              :id "{pessoa["_id"]}" ;
              :idade {pessoa["idade"]} ;
              :primeiroNome "{pessoa["nome"]["primeiro"]}" ;
              :ultimoNome "{pessoa["nome"]["último"]}" .


###  http://github.com/ruippgoncalves/rpcw2025/TPC1#{name}Pratica
:{name}Pratica rdf:type owl:NamedIndividual ,
                              :Pratica ;
                     :noClube :{pessoa["clube"].replace(" ", "-")} ;
                     :praticaModalidade :{pessoa["modalidade"]} ;
                     :éPraticada :{name} ;
                     :federado "{"true" if pessoa["federado"] else "false"}"^^xsd:boolean .


###  http://github.com/ruippgoncalves/rpcw2025/TPC1#{name}Exame
:{name}Exame rdf:type owl:NamedIndividual ,
                            :Exame ;
                   :exameDe :{name} ;
                   :data "{pessoa["dataEMD"]}"^^xsd:date ;
                   :resultado "{"true" if pessoa["resultado"] else "false"}"^^xsd:boolean .

''')
