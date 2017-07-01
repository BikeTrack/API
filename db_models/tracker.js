const mongoose = require('mongoose');
const shortid = require('shortid');

const trackerSchema = new mongoose.Schema({
    _id: {type: String, 'default': shortid.generate}, // === device in the data receive
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    battery: [{
      pourcentage: Number,
      timestamp: Date
    }],
    choc: [{
      timestamp: Date,
      checked: Boolean
    }],
    locations: [{
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [{ // lng / lat / alt => in this order because MongoDB use lng 1st
        type: Number
      }],
      snr: String, // the signal to noise ratio (in dB – Float value with two maximum fraction digits)
      station: String,
      data: String,
      avgSnr: String, // the average signal to noise ratio computed from the last 25 messages (in dB – Float value with two maximum fraction digits) or «N/A». The device must have send at least 15 messages.
      rssi: String, // the RSSI (in dBm – Float value with two maximum fraction digits). If there is no data to be returned, then the value is null.
      seqNumber: String // the sequence number of the message if available
    }]
  })

module.exports = mongoose.model('Tracker', trackerSchema)
