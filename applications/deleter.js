const sqlite = require('sqlite3')
const path = require('path')
const fs = require('fs')

class Deleter {
    constructor(appRoot = global.appRoot) {
        // noinspection JSUnresolvedFunction
        this.db = new sqlite.Database(path.join(appRoot, 'database.db'))

        this.db.run("CREATE TABLE IF NOT EXISTS delete_timers " +
            "(path TEXT, timestamp INTEGER, " +
            "PRIMARY KEY(path))")

        this.root = appRoot

        this.#importTimers().then(r => {
            console.log(`Imported ${r['started']} timers, deleted ${r['deleted']} expired files`)})
    }

    /**
     * Add a file to delete after the specified time
     * @param filePath
     * @param time time in seconds
     */
    async add(filePath, time) {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw Error("File does not exist")
        }
        // Check if file is in the uploads folder
        let rel_path = path.relative(path.join(this.root, 'uploads'), filePath)
        if (rel_path.includes('..')) {
            throw Error("File is outside of upload folder")
        }

        console.log("Adding deletion timer for ", filePath)

        // Add timer for deletion
        this.#addTimer(filePath, time)

        // Get timestamp of deletion
        let timestamp = Math.round(Date.now() + time * 1000)

        return new Promise(((resolve, reject) => {
            this.db.run("INSERT INTO delete_timers(path, timestamp) VALUES (?, ?)",
                [filePath, timestamp],
                (error) => {error ? reject(error) : resolve()})
        }))
    }

    #addTimer(path, time) {
        setTimeout(async () => {
            await this.#delete(path)
        }, time * 1000);
    }

    async #delete(filePath) {
        console.log("Deleting ", filePath)

        let rem = new Promise(((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                err ? console.log("Ignored error", err.message) : resolve()
            })
        }))

        let db_rem = new Promise(((resolve, reject) => {
            this.db.run("DELETE FROM delete_timers WHERE path = ?",
                [filePath],
                (error) => {error ? reject(error) : resolve()})
        }))

        return Promise.all([rem, db_rem])
    }

    /**
     * Import timers from the database
     */
    async #importTimers() {
        return new Promise(((resolve, reject) => {
            let deleted = 0,
                started = 0
            this.db.each("SELECT * FROM delete_timers", [], (err, result) => {
                if (err) reject(err)
                // For each timer from the database:
                let time = result['timestamp'] - Date.now()
                if (time > 0) {
                    this.#addTimer(result['path'], time)
                    started++
                } else {
                    this.#delete(result['path'])
                    deleted++
                }
            });
            resolve({started: started, deleted: deleted})
        }))
    }
}

module.exports = {
    Deleter
}