const sqlite = require('sqlite3')
const path = require('path')
const crypto = require('crypto')

class Applications {
    constructor(appRoot = global.appRoot) {
        // noinspection JSUnresolvedFunction
        this.db = new sqlite.Database(path.join(appRoot, 'database.db'))
        this.db.run("CREATE TABLE IF NOT EXISTS applications " +
            "(name TEXT, secret TEXT, salt TEXT, iterations INTEGER," +
            "PRIMARY KEY(name))")
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

    async validate(name, secret) {
        // Get from database
        let p = new Promise(((resolve, reject) => {
            this.db.get("SELECT * FROM applications WHERE name = ?", [name],
                (error, row) => {error ? reject(error) : resolve(row)})
        }))

        let row = await p
        // If the name is not in the database, return false
        if (row === undefined) return false

        // Hash the provided secret and compare, return true if they are equal
        return row['secret'] === hash(secret, row['salt'], row['iterations']);
    }
}

function generateHash(string) {
    let salt = crypto.randomBytes(20).toString('hex')
    let iterations = randomInt(1000, 10000)

    return {input: string, hash: hash(string, salt, iterations), salt: salt, iterations: iterations}
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