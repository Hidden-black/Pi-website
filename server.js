const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const app = express();


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const visitorLogStream = fs.createWriteStream(path.join(__dirname, 'visitors.log'), { flags: 'a' });
const visitorIPs = new Set();

morgan.token('remote-addr', function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

function logVisitorIP(ip) {
    if (!visitorIPs.has(ip)) {
        visitorIPs.add(ip);
        visitorLogStream.write(`${ip}\n`);
    }
}

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logVisitorIP(ip);
    next();
});

app.use(morgan(':remote-addr - :method :url :status :response-time ms', {
    stream: accessLogStream,
    immediate: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => console.log("Server running at http://localhost:5000/"));