const sqlite = require('sqlite3')
const path = require('path')
const crypto = require('crypto')

class Applications {
    constructor() {
        // noinspection JSUnresolvedFunction
        this.db = new sqlite.Database(path.join(global.appRoot, 'database.db'))
    }

    async create(name) {
        // Generate a secret
        let secret = crypto.randomBytes(20).toString('hex')
        let secret_hash = generateHash(secret)

        // Insert into database
        await new Promise(((resolve, reject) => {
            this.db.run("INSERT INTO applications(name, secret, salt, iterations) VALUES (?, ?, ?, ?)",
                [name, secret_hash.hash, secret_hash.salt, secret_hash.iterations],
                (error) => {error ? reject(error) : resolve()})
        }))

        return secret_hash
    }
}

function generateHash(string) {
    let salt = crypto.randomBytes(20).toString('hex')
    let iterations = randomInt(1000, 10000)

    return {salt: salt, iterations: iterations, hash: hash(string, salt, iterations)}
}

function hash(string, salt, iterations) {
    let hashedString = salt + string
    for (let i = 0; i < iterations; i++) {
        hashedString = crypto.createHash('md5').update(hashedString).digest('hex');
    }
    return hashedString
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

module.exports = {
    Applications
}