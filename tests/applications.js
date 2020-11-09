const path = require("path");
const {Applications} = require("../applications/applications");

global.appRoot = path.resolve(__dirname, '..');

async function testCreate() {
    const name = 'test'

    let a = new Applications()
    let secret = await a.create(name)
    console.log(secret)

    // Check with correct secret
    console.assert(await a.validate(name, secret.input), "Correct secret validates false")
    // Check with incorrect secret
    console.assert(!await a.validate(name, secret.input + '123'), "Incorrect secret validates true")
}

testCreate().then()