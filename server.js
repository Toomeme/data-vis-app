// read in env settings
require('dotenv').config();
var http = require('http');

const express = require('express');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

var httpServer = http.createServer(app);

httpServer.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
