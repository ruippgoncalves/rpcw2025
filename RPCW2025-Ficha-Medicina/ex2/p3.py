from rdflib import Graph
import json

c = open('doentes.json')
reader = json.load(c)
ttl_output = "\n\n"

def st(s):
    return s.replace("(", "__").replace(")", "").replace(' ', '_')

count = 3

for row in reader:
    p = count
    count += 1
    name = row['nome']
    symptomes = map(st, row['sintomas'])

    ttl_output += f":Patient{p} a :Patient ;"
    ttl_output += f"            :name \"{name}\" ;"
    if symptomes:
        ttl_output += f"    :exhibitsSymptom {', '.join(f':{symptom}' for symptom in symptomes)} .\n\n"


c = open('med_tratamentos.ttl').read()
open('med_doentes.ttl', 'w').write(c + '\n' + ttl_output)
