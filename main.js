const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const _ = require('lodash')

// Setup Express
const app = express()
const port = 8000

// Add logging
app.use(morgan('dev'));
// Add cors
app.use(cors());
// Add body-parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// Add file upload
app.use(fileUpload({
    createParentPath: true
}));

// Add static files
app.use(express.static((path.join(__dirname, 'uploads'))))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/upload', async (req, res) => {
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
                file.mv(path.join(__dirname, 'uploads', file.name));

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
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})