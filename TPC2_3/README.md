---
title: Queries SPARQL
date: 18-02-2025
id: PG56011
author: Rui Gonçalves
---

# TPC2/3: Queries SPARQL

## Resumo

Desenvolvimento de queries SPARQL.

## Queries

### Quantos triplos existem na Ontologia?

```sparql
select (count (*) as ?count) {
    ?a ?p ?s .
}
```

### Que classes estão definidas?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

select ?a where {
    ?a rdf:type owl:Class .
} limit 100
```

### Que propriedades tem a classe "Rei"?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select distinct ?p where {
    ?a rdf:type :Rei .
    ?a ?p ?s .
} limit 100
```

### Quantos reis aparecem na ontologia?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select (count (?a) as ?count) where {
    ?a rdf:type :Rei .
} limit 100
```

### Calcula uma tabela com o seu nome, data de nascimento e cognome.

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome ?nasc ?cognome where {
    ?a rdf:type :Rei .
    ?a :nome ?nome .
    ?a :nascimento ?nasc .
    ?a :cognomes ?cognome .
} limit 100
```

### Acrescenta à tabela anterior a dinastia em que cada rei reinou.

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome ?nasc ?cognome ?dinastia where {
    ?monarca rdf:type :Rei .
    ?monarca :nome ?nome .
    ?monarca :nascimento ?nasc .
    ?monarca :cognomes ?cognome .
    ?reinado :temMonarca ?monarca .
    ?reinado :dinastia ?dinastia .
} limit 100
```

### Qual a distribuição de reis pelas 4 dinastias?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?dinastia (count (distinct ?monarca) as ?dist) where {
    ?reinado :dinastia ?dinastia .
    ?reinado :temMonarca ?monarca .
    ?monarca rdf:type :Rei .
} group by ?dinastia order by ?dinastia limit 100
```

### Lista os descobrimentos (sua descrição) por ordem cronológica.

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?desc ?descricao where {
    ?desc rdf:type :Descobrimento .
    ?desc :data ?data .
    ?desc :notas ?descricao .
} order by ?data limit 100
```

### Lista as várias conquistas, nome e data, com o nome do rei que reinava no momento.

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome ?data ?monarca where {
    ?conq rdf:type :Conquista .
    ?conq :nome ?nome .
    ?conq :data ?data .
    ?conq :temReinado ?reinado .
    ?reinado :temMonarca ?monar .
    ?monar :nome ?monarca .
} order by ?data limit 100
```

### Calcula uma tabela com o nome, data de nascimento e número de mandatos de todos os presidentes portugueses.

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome ?nascimento (count(distinct ?mandato) as ?mandatos) where {
    ?pres rdf:type :Presidente .
    ?pres :nome ?nome .
    ?pres :nascimento ?nascimento .
    ?pres :mandato ?mandato .
} group by ?pres ?nome ?nascimento limit 100
```

### Quantos mandatos teve o presidente Sidónio Pais? Em que datas iniciaram e terminaram esses mandatos?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select (count(distinct ?mandato) as ?mandatos) where {
    ?pres rdf:type :Presidente .
    ?pres :nome "Sidónio Bernardino Cardoso da Silva Pais" .
    ?pres :mandato ?mandato .
} group by ?pres limit 100
```

### Quais os nomes dos partidos politicos presentes na ontologia?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome where {
    ?par rdf:type :Partido .
    ?par :nome ?nome .
} limit 100
```

### Qual a distribuição dos militantes por cada partido politico?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome (count (distinct ?militante) as ?militantes) where {
    ?par rdf:type :Partido .
    ?par :nome ?nome .
    ?par :temMilitante ?militante .
} group by ?par ?nome limit 100
```

### Qual o partido com maior número de presidentes militantes?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX : <http://www.semanticweb.org/andre/ontologies/2015/6/historia#>

select ?nome (count (distinct ?militante) as ?militantes) where {
    ?par rdf:type :Partido .
    ?par :nome ?nome .
    ?par :temMilitante ?militante .
} group by ?par ?nome order by desc(?militantes) limit 1
```
