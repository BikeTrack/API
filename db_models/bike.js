const mongoose = require('mongoose');

const Schema = mongoose.Schema

const bikeSchema = new Schema({
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  name: String,
  color: String,
  brand: String,
  tracker: {type: Number, index: true},
  // picture: {type: ???}
  // gps: [{type: Schema.Types.Point}]

})

const Bike = mongoose.model('Bike', bikeSchema)

module.exports = Bike
