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
        [Number, Number, String] // lng first / lat / timestamp
    ]
})

const Tracker = mongoose.model('Tracker', trackerSchema)

module.exports = Tracker
