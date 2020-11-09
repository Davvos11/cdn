// POST function
async function login(req, res) {
    let name = req.body.name,
        secret = req.body.secret

    if (name === undefined || secret === undefined) return res.send(400, "Please provide a name and secret")

    if (await global.applications.validate(name, secret)) {
        // If secret is correct, add session
        req.session.application = name
        return res.send(204)
    } else {
        return res.send(401, "Authentication failed")
    }
}

// POST function
async function signup(req, res) {
    let name = req.body.name

    if (name === undefined) return res.send(400, "Please provide a name")

    try {
        let result = await global.applications.create(name)
        return res.send(result.input) // (return the non-hashed secret)
    } catch (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
            return res.send(400, "An application with that name already exists")
        } else {
            throw err
        }
    }
}

module.exports = {
    login,
    signup
}