// read in env settings
require('dotenv').config();

const express = require('express');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));
