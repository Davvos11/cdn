const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
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

// Add static files
app.use(express.static((path.join(__dirname, 'public'))))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})