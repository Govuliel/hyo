import csv from 'neat-csv'

const file = await fs.readFile('./static/words.csv', 'utf8')

const neuVowels = {
    o: 'o', ö: 'o',
    e: 'e', ë: 'e',
    i: 'i', ı: 'i',
    u: 'u', ü: 'u',
}
const neutralize = (word) => word.split().map((c) => neuVowels[c] ?? c).join("")

const minPairs = {
    p:   ['v', 't'],
    k:   ['h', 'g'],
    g:   ['h', 'k', 'd'],
    t:   ['d', 'z', 's', 'n', 'p'],
    z:   ['ȷ', 't'],
    d:   ['t', 'g', 'ȷ'],
    ȷ:   ['z', 'd'],
    s:   ['v', 'z', 't'],
    x:   ['s', 'v', 'z'],
    v:   ['s', 'x', 'p', 'w'],
    h:   ['ꞌ', 'k', 'g'],
    m:   ['n'],
    n:   ['m'],
    'ꞌ': ['h', 'l'], // adding "l" for verb contractions
    w:   ['ꞌ', 'v', 'l'],
    l:   ['y', 'w'],
    y:   ['ꞌ', 'l'],
    // Vowels
    o:   ['u'],           ö:   ['ü', 'u'],
    e:   ['ı', 'u'],      ë:   ['ı', 'i'],
    ı:   ['o', 'i', 'ë'], i:   ['ë', 'ı'],
    u:   ['o', 'ö', 'e'], ü:   ['ö'],
}

// let badSyllablesIdentified = false
// const badSyllablesMessage = "Some words have improper syllable structure"
const syllableRegex = /(?<onset>[ꞌhkgtzxsdȷpvmnlwy])?(?<nucleus>[oöeëıiuü])(?<coda>[tksznl](?![oöeëıiuü]))?/gi

const records = await csv(file, {
    delimiter: ',',
    columns: true,
})

console.log('Grabbing words from records...')

const words = []
const neutrals = []
const collisions = []

for (const record of records) {
    words.push(record["Hisyëö"])
    neutrals.push(neutralize(record["Hisyëö"]))   
}

console.log('Reviewing collisions...')
    
for (let word of words) {
    const matches = word.matchAll(syllableRegex)
    const sylSegments = []
    const sylValues = []
    Array.from(matches).forEach((m) => {
        sylSegments.push(m.groups); sylValues.push(m[0])
    })
    // if (sylValues.filter((s) => s.length < 2).length > 1) {
    //     if (!badSyllablesIdentified) {
    //         console.log(badSyllablesMessage)
    //         badSyllablesIdentified = true
    //     }
    //     console.log(`word:${word}\tmatches: ${sylValues}`)
    // }
    sylSegments.forEach((syllable, i) => {
        let {onset, nucleus, coda} = syllable
        if (!onset) onset = "'"
        if (minPairs[onset]) for (let collider of minPairs[onset]) {
            let collSyl = sylValues.slice()
            collSyl[i] = makeSyllable(collider, nucleus, coda)
            let onsetChange = collSyl.join('')
            if (words.includes(onsetChange))
                collisionFound(word, onsetChange, priorLength(collSyl.slice(0, i)))
            else if (neutrals.includes(neutralize(onsetChange)))
                collisionFound(word, onsetChange, priorLength(collSyl.slice(0, i)))
        }
        for (let collider of minPairs[nucleus]) {
            let collSyl = sylValues.slice()
            collSyl[i] = makeSyllable(onset, collider, coda)
            const nucleChange = collSyl.join('')
            if (words.includes(nucleChange)) collisionFound(word, nucleChange)
        }
    })

    let priorCoda = undefined
    for (let {onset, _, coda} of sylSegments) {
        // coda-/k/ cannot be followed by onset-/g/
        if (['k',].includes(priorCoda) && ['g',].includes(onset)) {
            console.log(`Bad syllable boundary: ${word}`)
        }
        // coda-/t/ cannot be followed by onset-/d/ or onset-/ʃ/
        if (['t',].includes(priorCoda) && ['d', 'x',].includes(onset)) {
            console.log(`Bad syllable boundary: ${word}`)
        }
        // coda-/ t͡ɕ/ cannot be followed by onset-/s/
        if (['z',].includes(priorCoda) && ['s',].includes(onset)) {
            console.log(`Bad syllable boundary: ${word}`)
        }
        // coda-/s/ cannot be followed by onset-/ʃ/
        if (['s',].includes(priorCoda) && ['x',].includes(onset)) {
            console.log(`Bad syllable boundary: ${word}`)
        }
        // onset-/h/ cannot exist after any coda
        if (['k','t','s','z','l'].includes(priorCoda) && ['h',].includes(onset)) {
            console.log(`Bad syllable boundary: ${word}`)
        }
        priorCoda = coda
    }
}

function makeSyllable(collider, nucleus, coda) {
    return `${collider ?? ''}${nucleus ?? ''}${coda ?? ''}`
}

function collisionFound(word, collision, location) {
    
    if (!(collisions.includes(word) && collisions.includes(collision))) {
        collisions.push(word, collision)
        
        // console.debug(
        //     `Collision between "${word}" and "${collision}" ${chalk.grey(`(priorLength: ${location})`)}`
        // )
    
        const fst1 = word.slice(0, location)
        const loc1 = chalk.red(word.slice(location, location + 1))
        const rst1 = word.slice(location + 1)
    
        const fst2 = collision.slice(0, location)
        const loc2 = chalk.yellow(collision.slice(location, location + 1))
        const rst2 = collision.slice(location + 1)
    
        console.log(`Collision between "${fst1}${loc1}${rst1}" and "${fst2}${loc2}${rst2}"`)

    }

}

function priorLength(syllables, i) {
    let count = 0
    for (const syllable of syllables) count = count + syllable.length
    return count
}