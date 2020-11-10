const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto')

const upload = require('./routes/upload')
const login = require('./routes/login')
const {Applications} = require("./applications/applications");

global.appRoot = path.resolve(__dirname);

// Settings
const SESSION_KEY_NAME = 'user_sid'

// Create applications object (with database)
global.applications = new Applications()

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
// Add cookie parser
app.use(cookieParser())
// Add session management
app.use(session({
    key: SESSION_KEY_NAME,
    secret: crypto.randomBytes(20).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
// Check if the user still has a session cookie but is not set as logged in (happens after a server restart)
app.use((req, res, next) => {
    if (req.cookies[SESSION_KEY_NAME] && !req.session.application) {
        res.clearCookie(SESSION_KEY_NAME);
    }
    next();
});

// middleware function to check for logged-in users
let sessionChecker = (req, res, next) => {
    if (req.session.application && req.cookies[SESSION_KEY_NAME]) {
        // If the user is logged in, continue
        next()
    } else {
        // Otherwise return unauthorised
        res.send(401, "Please login first on /login")
    }
};


// Add static files
app.use('/uploads', express.static((path.join(global.appRoot, 'uploads'))))

app.get('/', (req, res) => {
    res.send("<h1>Davvos11 CDN</h1><h2>Endpoints</h2>" +
        "POST /login with 'name' and 'secret' as form-data<br>" +
        "POST /upload with 'files' as (file) form-data")
})

// Upload route
app.post('/upload', sessionChecker, upload.upload);
// Login route
app.post('/login', login.login)

app.listen(port, () => {
    console.log(`Davvos11 CDN listening at http://localhost:${port}`)
})
