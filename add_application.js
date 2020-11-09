const path = require('path')
const prompt = require('prompt');

const {Applications} = require("./applications/applications");

let applications = new Applications(path.resolve(__dirname))

// Get app name
prompt.start();

p = new Promise((resolve, reject) => {
    prompt.get(['name'],
        async (err, result) => {err ? reject(err) : resolve(result.name)})
})

p.then(async name => {
    try {
        // Add to database
        let secret = await applications.create(name)
        // Show non-hashed secret
        console.log(secret.input)
        process.exit()
    } catch (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
            console.error("An application with that name already exists")
            process.exit(1)
        } else {
            throw err
        }
    }
}).catch(e => {
    console.error(e)
    process.exit(1)
})