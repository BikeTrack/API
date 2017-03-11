const mongoose = require('mongoose');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

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
  bikes: [{type: String, index: true}]
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
