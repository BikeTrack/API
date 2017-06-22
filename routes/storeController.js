const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('../config/')
const bcrypt = require('bcrypt')
const User = mongoose.model('User')
const Bike = mongoose.model('Bike')
const Tracker = mongoose.model('Tracker')

/*////////////////////////////
//                          //
//  Function /profile route //
//                          //
*/////////////////////////////

exports.biketrack = async (req, res) => {
  console.log(req.body);
  res.end()
}



// router.post('/signup', signup)
exports.signup = async (req, res) => {
  const mail = req.body.mail
  const password = req.body.password

  if (!mail || !password) {
      res.status(404)
      res.json({success: false, message: "Mail || Passowrd is blank"})
      res.end()
      return
  }

  try {
    const user = await User.findOne({mail})
    if (user) {
      res.status(409)
      res.json({success: false, message: 'User already in the DB'})
      res.end()
      return
    }
    const newUser = new User({mail: mail, password: password})
    await newUser.save()
    res.json({success: true, message: "Try to login now motherfucker"})
    res.end()
    return

  } catch(e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.post('/authenticate', login)
exports.login = async (req, res) => {
  const mail = req.body.mail
  const password = req.body.password

  if (!mail || !password) {
      res.status(404)
      res.json({success: false, message: "mail || login blank"})
      res.end()
      return
  }

  try {
    const user = await User.findOne({mail})
    if (!user) {
      res.status(401)
      res.json({success: false, message: 'Authentication failed. User not found.'})
      res.end()
      return
    }
    const testPassword = user.comparePassword(password, (err, isMatch) => {
      if (err) {
          res.status(400)
          res.json({success: false, err})
          res.end()
          return
      } else if (!isMatch) {
          res.status(401)
          res.json({success: false, message: "Authentication failed. Wrong password."})
          res.end()
          return
      }
      // if user is found and password is right
      // create a token
      const token = jwt.sign(user, config.jwt.secret, {
          expiresIn: "24h", // expires in 24 hours
          algorithm: 'HS512'
      });
      res.json({success: true, token: token, userId: user.id, message: "Take my lord, this present is for you and only you"})
      res.end()
      return
    })
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.get('/profile/:userId', getProfile)
exports.getProfile = async (req, res) => {
  const userId = req.params.userId

  try {
    const user = await User.findById(userId, "-password")

    if (!user) {
      res.status(400)
      res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
      res.end()
      return
    }

    res.json({success: true, user: user})
    res.end()
    return

  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.patch('/profile/', update)
exports.update = async (req, res) => {
  const userId = req.body.userId
  const update = req.body.update

  try {
    const user = await User.findByIdAndUpdate(userId, update, {
        new: true,
        select: '-password'
    })
    if (!user) {
      res.status(401)
      res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
      res.end()
      return
    }
    res.json({success: true, user: user, message: `User with _id :${userId} have been updated.`})
    res.end()
    return

  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.delete('/profile/', deleteProfile)
exports.deleteProfile = async (req, res) => {
  const userId = req.body.userId

  try {
    const user = await User.findByIdAndRemove(userId)
    if (!user) {
      res.status(401)
      res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
      res.end()
      return
    }
    res.json({success: true, message: `User with userId:${userId} have been remove from the DB`})
    res.end()
    return
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// function authFacebook(req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   res.json({ Test: '1234' })
// }
//
// function authGoogle(req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   res.json({ Test: '1234' })
// }
//
// function addFacebook(req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   res.json({ Test: '1234' })
// }
//
// function addGoogle(req, res) {
//   res.setHeader('Content-Type', 'application/json')
//   res.json({ Test: '1234' })
// }



/*////////////////////////////
//                          //
//  Function /bike route    //
//                          //
*/////////////////////////////



// router.post('/bike', addBike)
exports.addBike = async (req, res) => {
  const userId = req.body.userId
  const bikeInfo = req.body.bikeInfo

  if (!bikeInfo.tracker || !userId) {
    res.status(401)
    res.json({success: false, message: 'Wrong arguments in the request'})
    res.end()
    return
  }

  try {
    const user = await User.findById(userId)
    if (!user) {
      res.status(401)
      res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
      res.end()
      return
    }

    const newBike = await (new Bike(bikeInfo)).save()
    // const newBike = new Bike({name: bikeInfo.name, color: bikeInfo.color, brand: bikeInfo.brand, tracker: bikeInfo.tracker})
    const bikeList = user.bikes
    bikeList.push(newBike)

    await user.update({bikes: bikeList})

    res.json({
      success: true,
      bikeId: newBike.id,
      message: `Added Bike: ${newBike.id} to UserId: ${userId}`
    })

  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.get('/bike/:bikeId', getBikeInfo)
exports.getBikeInfo = async (req, res) => {
  const bikeId = req.params.bikeId

  const bike = await Bike.findById(bikeId)

  if (!bike) {
    res.status(400)
    res.json({
      success: false,
      message: `Cannot find an Bike with the bikeId: ${bikeId}`
    })
    res.end()
    return
  }
  res.json({
    success: true,
    bike: bike
  })
  res.end()
  return
}

// router.delete('/bike/', deleteBike)
function deleteBike(req, res) {
    const userId = req.body.userId
    const bikeId = req.body.bikeId

    User.findById(userId, (err, user) => {
        if (err) {
            res.json({success: false, err})
            res.end()
        }

        if (!user) {
            res.status(401)
            res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
            res.end()
            return
        }

        const newBikeList = user.bikes.filter(bId => bId !== bikeId)
        if (newBikeList === user.bikes) {
            res.status(401)
            res.json({success: false, message: `Cannot find a bike with this ID : ${bikeId} for this User`})
            res.end()
            return
        }

        user.update({
            bikes: newBikeList
        }, err => {
            if (err) {
                res.json({success: false, err})
                res.end()
            }
            console.log("Bike deleted from User DB");
        })

        Bike.findByIdAndRemove(bikeId, (err, bike) => {
            if (err) {
                res.json({success: false, err})
                res.end()
            }

            if (!bike) {
                res.status(401)
                res.json({success: false, message: `Bike was found and deleted from the User DB but not found in Bikes DB`})
                res.end()
                return
            }

            res.json({
              success: true,
              message: `Bike with bikeId: ${bikeId} have been remove from the 2 DB`
            })
            res.end()
            return

        })
    })
}

// router.patch('/bike/', updateBike)
function updateBike(req, res) {
    const bikeId = req.body.bikeId
    const update = req.body.update

    Bike.findByIdAndUpdate(bikeId, update, {new: true}, (err, newBike) => {
        if (err) {
            res.json({success: false, err})
            res.end()
        } else if (!newBike) {
            res.status(401)
            res.json({
              success: false,
              message: `No Bike with this ID ${bikeId} found`
            })
            res.end()
            return
        }

        res.json({success: true, bike: newBike, message: `Bike updated`})
        res.end()
        return

    })
}


/*////////////////////////////
//                          //
//  Function /tracker route //
//                          //
*/////////////////////////////



// router.post('/tracker', addTracker)
function addTracker(req, res) {
  const bikeId = req.body.bikeId
  const trackerInfo = req.body.trackerInfo


  console.log('BikeId', bikeId);
  console.log('Tracker Info : \n',trackerInfo);


  Bike.findById(bikeId, (err, bike) => {
    if (err) {
        res.json({success: false, err})
        res.end()
    } else if (!bike) {
      res.status(401)
      res.json({
        success: false,
        message: `No Bike with this ID ${bikeId} found`
      })
      res.end()
      return
    } else {
      const newTracker = new Tracker(trackerInfo)
      console.log(`Tracker ${newTracker}`);
      newTracker.save((err, t) => {
          if (err) {
              res.json({success: false, err})
              res.end()
              return
          }
          const trackerId = t._id
          bike.update({
              tracker: trackerId
          }, err => {
              if (err) {
                  res.json({success: false, err})
                  res.end()
              }
              res.json({
                success: true,
                trackerId: t.id,
                message: `Added Tracker: ${t.id} to Bike: ${bikeId}`
              })
              res.end()
          })
      })

    }
  })
}

// router.delete('/tracker/', deleteTracker)
function deleteTracker(req, res) {
    const bikeId = req.body.bikeId
    const trackerId = req.body.trackerId

    Bike.findById(bikeId, (err, bike) => {
      if (err) {

          res.json({success: false, err})
          res.end()
          return

      } else if (!bike){

        res.status(401)
        res.json({
          success: false,
          message: `No Bike with this ID ${bikeId} found`
        })
        res.end()
        return

      } else {

        const newTrackerList = bike.trackers.filter(tId => tId !== trackerId)

        if (newTrackerList === bike.trackers) {
          res.status(401)
          res.json({
            success: false,
            message: `Cannot find a tracker with this ID : ${trackerId} for this Bike`
          })
          res.end()
          return
        }

        bike.update({
          trackers: newTrackerList
        }, err => {
          if (err) {
              res.json({
                success: false,
                err
              })
              res.end()
          }
        })

        res.json({
          success: true,
          message: `Tracker with trackerId: ${trackerId} have been remove the User and Bike DB`
        })
        res.end()
        return


        // Prefered a soft delete from the Database to keep inforamtion for futur data analysis.
        // Tracker.findByIdAndRemove(trackerId, (err, tracker) => {
        //   if (err) {
        //       res.json({success: false, err})
        //       res.end()
        //   }
        //
        //   if (!tracker) {
        //       res.status(401)
        //       res.json({
        //         success: false,
        //         message: `Tracker was found and deleted from the Bike DB but not found in Tracker DB`
        //       })
        //       res.end()
        //       return
        //   }
        //
        //   res.json({
        //     success: true,
        //     message: `Tracker with trackerId: ${trackerId} have been remove from the 2 DB`
        //   })
        //   res.end()
        //   return
        // })
      }
    })
}

// router.patch('/tracker/', updateTracker)
function updateTracker(req, res) {
    const trackerId = req.body.trackerId
    const gps = req.body.gps

    // add check on gps valid format

    Tracker.findById(trackerId, gps, {new: true}, (err, newTracker) => {
      if (err) {
          res.json({success: false, err})
          res.end()
      } else if (!newTracker) {
        res.status(401)
        res.json({
          success: false,
          message: `No Tracker with this ID ${trackerId} found`
        })
        res.end()
        return
      }

      res.json({
        success: true,
        bike: newTracker,
        message: `Tracker updated`
      })
      res.end()
      return
    })
}

// router.get('/bike/:id/map', mapInfo)
function mapInfo(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({Test: '1234'})
}

// router.post('/alert', alert)
function alert(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({Test: '1234'})
}

// router.get('/settings/:id', getSettings)
function getSettings(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({Test: '1234'})
}

// router.put('/settings/:id', updateSettings)
function updateSettings(req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.json({Test: '1234'})
}
