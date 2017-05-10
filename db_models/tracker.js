const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema

const trackerSchema = new Schema({
    _id: {type: String, 'default': shortid.generate},
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    coordinates: [
        {
          timeStamp: Date,
          lng: Number,
          lat: Number,
          alt: Number
        }
    ]
})

const Tracker = mongoose.model('Tracker', trackerSchema)

module.exports = Tracker
