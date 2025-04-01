from rdflib import Graph
import csv

c = open('Disease_Syntoms.csv')
reader = csv.reader(c)
headers = next(reader)
ttl_output = ""
all_symptoms = set()
all_disseases = set()

def st(s):
    return s.replace("(", "__").replace(")", "").replace(' ', '_')

for row in reader:
    disease = st(row[0])
    symptoms = [st(symptom.strip()) for symptom in row[1:] if symptom]

    for s in symptoms:
        all_symptoms.add(s)
    
    if disease in all_disseases:
        ttl_output += f":{disease}"
    else:
        ttl_output += f":{disease} a :Disease ;\n"
        all_disseases.add(disease)
    if symptoms:
        ttl_output += f"    :hasSymptom {', '.join(f':{symptom}' for symptom in symptoms)} .\n\n"


for s in all_symptoms:
    ttl_output += f":{s} a :Symptom .\n"

ttl_output += "\n\n"

c = open('Disease_Description.csv')
reader = csv.reader(c)
headers = next(reader)

for row in reader:
    d = st(row[0])
    esc = row[1].replace('"', '\\"')
    ttl_output += f":{d} :description \"{esc}\" .\n"

c = open('medical_4.ttl').read()
open('med_doencas.ttl', 'w').write(c + '\n' + ttl_output)
