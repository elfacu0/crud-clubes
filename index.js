const express = require('express');
const PORT = 5000;

const app = express();

app.get('/', (req, res) => {
    res.end('Hello');
});

app.get('/teams/:id', (req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(`
        <html>
            <head>
                <title>${req.params.id}</title>
            </head>
            <body>
                <h1>El equipo es : ${req.params.id}</h1>
            </body>
        </html>
    `);
});

console.log('listening port : ', PORT);

app.listen(PORT);
