const path = require('path')

module.exports = {
    upload
}

async function upload (req, res) {
    try {
        if(!req.files || !req.files['files']) {
            res.send({
                status: false,
                message: 'No files uploaded'
            });
        } else {
            let data = []
            let files = req.files['files']
            // Loop over files
            for (let i in files) {
                if (!files.hasOwnProperty(i)) continue
                let file = files[i]

                // Move the file to the correct location
                file.mv(path.join(global.appRoot, 'uploads', file.name));

                data.push({
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                })
            }

            //send response
            res.send({
                status: true,
                message: (data.length === 1 ? 'File is uploaded' : 'Files are uploaded'),
                data: data
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }
}