const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: {type: String, 'default': shortid.generate},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  name: String,
  mail: {type: String, index: true, required: true},
  password: {type: String, required: true},
  google: String,
  facebook: String,
  bikes: [Number]
})

const User = mongoose.model('User', userSchema)

module.exports = User
