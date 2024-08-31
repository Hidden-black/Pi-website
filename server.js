const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const visitorLogStream = fs.createWriteStream(path.join(__dirname, 'visitors.log'), { flags: 'a' });

const visitorIPs = new Set();

morgan.token('remote-addr', function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

app.use(morgan('combined', { stream: accessLogStream }));

function logVisitorIP(ip) {
    if (!visitorIPs.has(ip)) {
        visitorIPs.add(ip);
        visitorLogStream.write(`User IP: ${ip} - First visit at ${new Date().toISOString()}\n`);
    }
}

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logVisitorIP(ip);
    next();
});

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: false }));

const AUTH_CREDENTIALS = { username: 'admin', password: 'password' };

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
        req.session.authenticated = true;
        res.redirect('/private');
    } else {
        res.status(401).send('Unauthorized');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next();
    }
    res.redirect('/login');
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/private', ensureAuthenticated, express.static(path.join(__dirname, 'private')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => console.log("Server running at http://localhost:5000/"));