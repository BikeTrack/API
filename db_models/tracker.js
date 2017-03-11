const mongoose = require('mongoose');

const Schema = mongoose.Schema

const trackerSchema = new Schema({
    // _id: String,
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

const Bike = mongoose.model('Bike', bikeSchema)

module.exports =Bike
