const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const _ = require('lodash')

const upload = require('./routes/upload')
const {Applications} = require("./applications/applications");

global.appRoot = path.resolve(__dirname);

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
app.use(express.static((path.join(global.appRoot, 'uploads'))))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Upload route
app.post('/upload', upload.upload);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

async function main() {
    let a = new Applications()
    let s = await a.create('test4')
    console.log('secret', s)
}
main().then()
