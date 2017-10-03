const mongoose = require('mongoose');
const shortid = require('shortid');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  _id: {type: String,
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
  lastname: {
    type: String,
    trim: true
  },
  dob: {
    type: String, // a refaire avec un type Date
    trim: true
  },
  email: {
    type: String,
    index: true,
    lowercase: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  google: {
    type: String,
    trim: true
  },
  facebook: {
    type: String,
    trim: true
  },
  bikes: [{
    type: String,
    index: true
  }],
  img: {
    buffer: Buffer,
    contentType: String
  }
}, { runSettersOnQuery: true })

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

// userSchema.pre('update', function(next) {
//   const user = this
//
//   this.update({},{ $set: { updatedAt: new Date() } });
//
//   // const saltRound = Math.random() * (10 - 7) + 7; //random saltRound btw 7 - 14
//   //
//   // if (this.isModified('password')) {
//   //     bcrypt.genSalt(saltRound, function(err, salt){
//   //         if (err) return next(err)
//   //         bcrypt.hash(user.password, salt, function(err, hash){
//   //             if (err) return next(err)
//   //             user.password = hash
//   //             next()
//   //         })
//   //     })
//   // } else {
//   //     return next()
//   // }
// });

userSchema.methods.comparePassword = function(clearPass, callback) {
    bcrypt.compare(clearPass, this.password, function(err, isMatch) {
        if (err) {
            return callback(err)
        }
        callback(null, isMatch)
    });
};

module.exports = mongoose.model('User', userSchema)
