import axios from 'axios';

async function queryDb(query, endpoint, prefix) {
    const response = await axios.get(endpoint, {
        headers: {
            'Content-Type': 'application/json',
        },
        params: {
            'query': `prefix : <${prefix}>\n\n${query}`,
        }
    });

    const vars = response.data.head.vars;
    const binds = response.data.results.bindings;
    const results = [];

    for (const binding of binds) {
        const obj = {};

        for (const v of vars) {
            if (!(v in binding)) continue;

            let value = binding[v].value;

            if (typeof (value) === 'string' && value.startsWith(prefix)) {
                value = value.substring(prefix.length);
            }

            obj[v] = value;
        }

        results.push(obj);
    }

    return results;
}

async function queryDbRepresentation(endpoint, prefix) {
    const queryClasses = `
            SELECT DISTINCT ?class
            WHERE {
                ?class a owl:Class .

                FILTER(strstarts(str(?class), "${prefix}"))
            }
        `;

    const classes = await queryDb(queryClasses, endpoint, prefix);

    const queryClassInheritance = `
        SELECT DISTINCT ?subClass ?superClass
        WHERE {
            ?subClass rdfs:subClassOf ?superClass .
            ?subClass a owl:Class .
            ?superClass a owl:Class .

            FILTER(strstarts(str(?subClass), "${prefix}"))
            FILTER(strstarts(str(?superClass), "${prefix}"))
        }
    `;

    const classesInheritance = await queryDb(queryClassInheritance, endpoint, prefix);

    const queryObjectProperties = `
        SELECT DISTINCT ?property ?domain ?range
        WHERE {
            ?property a owl:ObjectProperty .
            ?property rdfs:range ?range .
            
            # Try to infer
            OPTIONAL { ?property rdfs:domain ?domain . }
            OPTIONAL {
                ?subject a ?domain ;
                         ?property ?object .
            }
            
            FILTER(strstarts(str(?property), "${prefix}"))
            FILTER(strstarts(str(?domain), "${prefix}"))
        }
    `;

    const objectProperties = await queryDb(queryObjectProperties, endpoint, prefix);

    const queryDataProperties = `
        SELECT DISTINCT ?property ?domain
        WHERE {
            ?property a owl:DatatypeProperty .
            
            # Try to infer
            OPTIONAL { ?property rdfs:domain ?domain . }
            OPTIONAL {                
                ?subject a ?domain ;
                         ?property ?object .
            }

            FILTER(strstarts(str(?property), "${prefix}"))
            FILTER(strstarts(str(?domain), "${prefix}"))
        }
    `;

    const dataProperties = await queryDb(queryDataProperties, endpoint, prefix);

    return {classes, classesInheritance, objectProperties, dataProperties};
}

async function generateDbRepresentation(endpoint, prefix) {
    const data = await queryDbRepresentation(endpoint, prefix);
    const classes = {};

    data.classes.forEach(c => {
        classes[c.class] = {
            className: c.class,
            inheritance: [],
            objectProperties: [],
            dataProperties: []
        };
    });

    data.classesInheritance.forEach(({subClass, superClass}) => {
        if (classes[subClass]) {
            classes[subClass].inheritance.push(classes[superClass]);
        }
    });

    data.objectProperties.forEach(p => {
        const {property, domain, range} = p;
        const propObject = {property, range: classes[range]};

        if (classes[domain]) {
            classes[domain].objectProperties.push(propObject);
        }
    });

    data.dataProperties.forEach(p => {
        const {property, domain} = p;
        const propObject = {property};

        if (classes[domain]) {
            classes[domain].dataProperties.push(propObject);
        }
    });

    return classes;
}

function camelToSpaced(camelCase) {
    return camelCase.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
}

function shuffle(strings) {
    const originalArray = [...strings];

    // Fisher-Yates algorithm
    const shuffledArray = [...originalArray];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    const indexMapping = originalArray.map(value => shuffledArray.indexOf(value));

    return {
        shuffledArray,
        indexMapping
    };
}

export async function generateGame(questionCount, endpoint, prefix) {
    const dbRepresentation = await generateDbRepresentation(endpoint, prefix);
    const classes = Object.values(dbRepresentation).filter(c => c.dataProperties.length > 0 && c.objectProperties.length > 0);

    const questionKinds = Array.from({length: questionCount}, () => Math.floor(Math.random() * 3));
    // 0 - multiple choice
    // 1 - true/false
    // 2 - selection

    const selectedClasses = Array.from({length: questionCount}, () => classes[Math.floor(Math.random() * classes.length)]);
    const selectDataProperties = selectedClasses.map((c) => c.dataProperties[Math.floor(Math.random() * c.dataProperties.length)]);
    const selectObjectProperties = selectedClasses.map((c) => c.objectProperties[Math.floor(Math.random() * c.objectProperties.length)]);
    const selectObjectDataProperties = selectObjectProperties.map((c) => c.range.dataProperties[Math.floor(Math.random() * c.range.dataProperties.length)]);
    const limitCount = questionKinds.map(k => k === 1 ? 2 : 4);

    return await Promise.all(
        questionKinds.map(async (kind, index) => {
            const className = selectedClasses[index].className;
            const dataProperty = selectDataProperties[index].property;
            const objectProperty = selectObjectProperties[index].property;
            const objectDataProperty = selectObjectDataProperties[index].property;
            const limit = limitCount[index];

            const query = `
                SELECT DISTINCT ?subject ?object
                WHERE {
                    ?sub a :${className} ;
                         :${dataProperty} ?subject ;
                         :${objectProperty} ?obj .
                    ?obj :${objectDataProperty} ?object .
                }
                ORDER BY RAND()
                LIMIT ${limit}
            `;

            const data = await queryDb(query, endpoint, prefix);
            const question = {};

            const classNameDisplay = camelToSpaced(className);
            const dataPropertyDisplay = camelToSpaced(dataProperty);
            const objectPropertyDisplay = camelToSpaced(objectProperty);
            const objectPropertyClassDisplay = camelToSpaced(selectObjectProperties[index].range.className);
            const objectDataPropertyDisplay = camelToSpaced(objectDataProperty);

            if (kind === 0) {
                const right = data[Math.floor(Math.random() * data.length)];

                question.question = `${classNameDisplay} de ${dataPropertyDisplay} ${right.subject} tem ${objectPropertyDisplay} ${objectDataPropertyDisplay}?`;
                question.options = data.map((c) => c.object.toString());
                question.answer = right.object.toString();
            } else if (kind === 1) {
                const right = data[Math.floor(Math.random() * data.length)];
                const res = data[0].object.toString();

                question.question = `${classNameDisplay} de ${dataPropertyDisplay} ${right.subject} tem ${objectPropertyDisplay} ${objectDataPropertyDisplay} o ${res}?`;
                question.options = ['Sim', 'Não'];
                question.answer = question.options[res === right.object.toString() ? 1 : 0];
            } else {
                question.question = `Associe ${classNameDisplay} a ${objectPropertyClassDisplay}:`;
                question.options = data.map((c) => c.subject.toString());
                question.options2 = data.map((c) => c.object.toString());
                const {shuffledArray, indexMapping} = shuffle(question.options2);
                question.options2 = shuffledArray;
                question.answer = indexMapping.join('/');
            }

            return question;
        })
    );

}

/*const endpoint = 'http://localhost:7200/repositories/historia';
const prefix = 'http://www.semanticweb.org/andre/ontologies/2015/6/historia#'

generateGame(10, endpoint, prefix).then(q => {
    console.log(q);
})*/
