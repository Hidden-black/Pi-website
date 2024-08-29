const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

morgan.token('remote-addr', function(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});

app.use(morgan(':remote-addr - :method :url :status :response-time ms'));

app.listen(5000, () => console.log("Server running at http://localhost:5000/"));