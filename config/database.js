// process.env.NODE_ENV = 'test';

var dbConfig = {};
const usernameDB = process.env.MONGO_USER;
const passDB = process.env.MONGO_PASS;

dbConfig.mongoURI = {
  development: 'mongodb://' + usernameDB + ':' + passDB + '@ds035026.mlab.com:35026/biketrack',
  test: 'mongodb://localhost/bikeTrackTesting'
};

module.exports = dbConfig;
