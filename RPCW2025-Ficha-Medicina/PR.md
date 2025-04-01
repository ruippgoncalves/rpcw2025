# Ex1

```
- Sr. João
- Agriculto
- Vila
- São Jóse
- Fazenada
- Fruta
- Maça, Laranja, Banana
- Animais
- vacas, galinhas, porcos
- Sra. Maria
- geleias
- feira local
- filhos
- pedro, ana
- pedro prefere animais
- ana prefere geleias
- vizinho
- sr. carlos
- fazenda 2
- maior
- vegetais
- tomates, alfaces, cenouras
- trocam vegetais por frutos
- vendem em conjunto nos sabados
- cachorro rex
- protege
- trator
- arar
- platar
- contrata
- colheita das frutas
- pagos por hora
- recebem refeições durante o trabalho
```


```
Pessoa
- nome

+ ascendete
+ descendente
+ vizinho
+ reside
+ ocupação
+ ajuda
+ eCasado

    Trabalhador
    - extra

    + pagamento
    + temporario

Localização
- nome

Ocupação
- nome

+ produz

Troca

+ bens
+ entre

Rentabilidade
    Venda
    - nome
    - data

    + localizada
    + produto
    + por

    TrabalhadorPorContaDeOutren
    + por

Bem
- nome
- função

    Produzivel
        Fruta
        Animal
        Vegetal

    Residencia
    - tipo

    + aoLado
    + éMaior
    + éMenor
    + localizada

Estação
- nome
```

## Queries:

### Quantas classes estão definidas na Ontologia?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
select (count(?s) as ?c) where {
    ?s a owl:Class .
}
```

### Quantas Object Properties estão definidas na Ontologia?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
select (count(?s) as ?c) where {
    ?s a owl:ObjectProperty .
}
```

### Quantos indivíduos existem na tua ontologia?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
select (count(?s) as ?c) where {
    ?s a owl:NamedIndividual .
}
```

### Quem planta tomates?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <http://github.com/ruippgoncalves/rpcw2025/historia#>
select ?i where {
    ?i :ocupacao ?o .
    ?o :produz :Tomates .
}
```

### Quem contrata trabalhadores temporários?

```sparql
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX : <http://github.com/ruippgoncalves/rpcw2025/historia#>
select ?i where {
    :temporario :pagamento ?o .
    ?o :por ?o2 .
    ?o2 :nome ?i .
}
```

# Ex2


