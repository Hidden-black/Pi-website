const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const app = express();

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
morgan.token('remote-addr', function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

app.use(morgan(':remote-addr - :method :url :status :response-time ms', { stream: logStream }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(5000, () => console.log("Server running at http://localhost:5000/"));