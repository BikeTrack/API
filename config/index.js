// process.env.NODE_ENV = 'test';

let config = {};
const usernameDB = process.env.MONGO_USER;
const passDB = process.env.MONGO_PASS;

config.mongoURI = {
  development: 'mongodb://' + usernameDB + ':' + passDB + '@ds157799.mlab.com:57799/biketrack',
  test: 'mongodb://localhost/bikeTrackTesting'
};

config.jwt = {
  secret: "BikeTrackPowa !!!"
}

module.exports = config;
