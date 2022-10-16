require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./routes/api');
const InitiateMongoServer = require('./config/db');

// Initiate Mongo Server
InitiateMongoServer();

const app = express();

// PORT
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.status(200).json({ message: 'API Working' });
});

app.use('/api', api);

app.listen(PORT, (req, res) => {
	console.log(`Server Started at PORT ${PORT}`);
});
