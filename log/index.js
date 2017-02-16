const FileStreamRotator = require('file-stream-rotator') // Add rotation log based on date
const fs = require('fs'); // Filesystem tools
const morgan = require('morgan'); // Log HTTP request

// Logfile
const logDirectory = __dirname;
// - ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
// - create a rotating write stream
const accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});
// - setup the logger
const log = morgan('combined', {stream: accessLogStream});

module.exports = log;
