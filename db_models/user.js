const mongoose = require('mongoose');

const Schema = mongoose.Schema

const userSchema = new Schema({
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  name: String,
  mail: {type: String, index: true},
  password: String,
  google: String,
  facebook: String,
  bikes: [Number]
})

const User = mongoose.model('User', userSchema)

module.exports = User
