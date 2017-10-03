const mongoose = require('mongoose');
const shortid = require('shortid');

const bikeSchema = new mongoose.Schema({
  _id: {
    type: String,
    'default': shortid.generate
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  tracker: {
    type: String,
    index: true
  },
  picture: String // pictureId in DB
}, { runSettersOnQuery: true })

module.exports = mongoose.model('Bike', bikeSchema)
