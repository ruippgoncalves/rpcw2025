from rdflib import Graph
import csv

c = open('Disease_Treatment.csv')
reader = csv.reader(c)
headers = next(reader)
ttl_output = "\n\n"

def st(s):
    return s.replace("(", "__").replace(")", "").replace(' ', '_')

for row in reader:
    disease = st(row[0])
    treatments = [st(symptom.strip()) for symptom in row[1:] if symptom]
    
    ttl_output += f":{disease}"
    if treatments:
        ttl_output += f"    :hasTreatment {', '.join(f':{treatment}' for treatment in treatments)} .\n\n"


c = open('med_doencas.ttl').read()
open('med_tratamentos.ttl', 'w').write(c + '\n' + ttl_output)
