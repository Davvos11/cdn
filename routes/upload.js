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
            let promises = []
            let files = req.files['files']
            let time = parseInt(req.body.time)
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
                file.mv(path.join(global.appRoot, filepath)).then(_ => {
                    // If a time-to-live has been specified, add timers
                    if (time !== undefined && !isNaN(time)) {
                        promises.push(global.deleter.add(filepath, time))
                    }
                });

                data.push(`${req.protocol}://${req.get('host')}/${filepath}`)
            }

            // Wait until all timers are added
            await Promise.all(promises)

            //send response
            res.send(data);
        }
    } catch (err) {
        console.error(err)
        res.status(500).send(err);
    }
}