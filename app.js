const express       = require('express');
const path          = require('path');
const logger        = require('morgan');
const bodyParser    = require('body-parser');
// const http          = require('http');
const mongoose      = require('mongoose');
const helmet        = require('helmet');
const cors          = require('cors');

// Load .env file
require('dotenv').config();

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Security Setup
app.use(helmet.frameguard()); // Default Value - Help to secure request by putting some setting in the header
app.use(cors());

// Logfile
const log = require('./log/');
app.use(log);
//
// API Key handler
const apiKey = require('./config/apiKey');
app.use(apiKey);

// MongoDB config
const config = require('./config/');
mongoose.Promise = global.Promise
mongoose.connect(config.mongoURI[app.settings.env], (err, res) => {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log('Connected to Database: ' + config.mongoURI[app.settings.env]);
  }
})

// Routes
const routes = require('./routes/');

app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
});

// Error handlers

// Development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    })
  })
};

// Production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  })
});

module.exports = app;
