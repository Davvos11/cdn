const path = require('path')

module.exports = {
    upload
}

async function upload (req, res) {
    try {
        if(!req.files || !req.files['files']) {
            res.send(400, "No files provided");
        } else {
            let data = []
            let files = req.files['files']
            let appName = req.session.application
            let timestamp = Date.now()

            if (!(files instanceof Array)) {
                // If a single file is uploaded, change it into an array
                files = [files]
            }

            // Loop over files
            for (let i in files) {
                if (!files.hasOwnProperty(i)) continue
                let file = files[i]

                // Move the file to the correct location
                let filepath = path.join('uploads', appName, String(timestamp), file.name)
                file.mv(path.join(global.appRoot, filepath));

                data.push(path.join(req.protocol + '://' + req.get('host'), filepath))
            }

            //send response
            res.send(data);
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(err);
    }
}