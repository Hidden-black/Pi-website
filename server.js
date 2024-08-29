const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Shashwat</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>
    `);
});

app.listen(5000, () => console.log("Server is running"));