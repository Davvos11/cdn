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

module.exports = {
    login
}