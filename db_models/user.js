const mongoose = require('mongoose');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema

const userSchema = new Schema({
  _id: {type: String, 'default': shortid.generate},
  created: {type: Date, default: Date.now},
  updated: {type: Date, default: Date.now},
  name: {
    type: String,
    trim: true
  },
  mail: {type: String, index: true, required: true, trim: true},
  password: {type: String, required: true},
  google: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  bikes: [{type: String, index: true, trim: true}]
})

userSchema.pre('save', function(next){
    const user = this

    const saltRound = Math.random() * (10 - 7) + 7; //random saltRound btw 7 - 14

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(saltRound, function(err, salt){
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash){
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        return next()
    }
});

userSchema.methods.comparePassword = function(clearPass, callback) {
    bcrypt.compare(clearPass, this.password, function(err, isMatch) {
        if (err) {
            return callback(err)
        }
        callback(null, isMatch)
    });
};

const User = mongoose.model('User', userSchema)

module.exports = User
