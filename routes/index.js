const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const User = require('../db_models/user')
const Bike = require('../db_models/bike')
const Tracker = require('../db_models/tracker')
const config = require('../config/')
const bcrypt = require('bcrypt')

// Test
router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.json({foo: 'bar'})
    // res.send('Hello, World!')
})
//
router.post('/signup', signup) // Crud login
router.post('/authenticate', login) // cRud login

router.use((req, res, next) => {
    // check header or url parameters or post parameters for token
    let token = req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.jwt.secret, (err, decoded) => {
            if (err) {
                return res.json({success: false, message: err});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({success: false, message: 'No token provided.'});
    }
})

router.get('/profile/:userId', getProfile) // cRud login
router.patch('/profile/', update) // crUd login
router.delete('/profile/', deleteProfile) // cruD login

// router.post('/authenticate/facebook', authFacebook) // crUd* login
// router.post('/authenticate/google', authGoogle) // crUd* login
// router.put('/profile/facebook/:userId', addFacebook) // crUd* login
// router.put('/profile/google/:userId', addGoogle) // crUd* login


router.post('/bike/', addBike) // Crud bike
router.get('/bike/:bikeId', getBikeInfo) // cRud bike
router.patch('/bike/', updateBike) // crUd bike
router.delete('/bike/', deleteBike) // cruD bike


router.post('/tracker/', addTracker)
router.delete('/tracker/', deleteTracker) // unpair tracker from a bike {id}
router.patch('/tracker/', updateTracker) // update tracker info from a bike
router.get('/bike/:id/map', mapInfo) // get the last {map} info from a bike {id}
// router.post('/alert', alert) // send alert to server (don't know how to make it work)
// router.get('/settings/', getSettings)
// router.put('/settings/', updateSettings)



/*////////////////////////////
//                          //
//  Function /profile route //
//                          //
*/////////////////////////////


// router.post('/signup', signup)
function signup(req, res) {
    const mail = req.body.mail
    const password = req.body.password //sha256 or bcrypt

    if (!mail || !password) {
        res.status(404)
        res.json({success: false, message: "Mail || Passowrd is blank"})
        res.end()
        return
    }

    User.findOne({
        mail
    }, (err, user) => {
        if (err) {
            res.status(400)
            res.json({success: false, err})
            res.end()
            return
        } else if (!user) {
            const newUser = new User({mail: mail, password: password})
            newUser.save(err => {
                if (err) {
                    res.status(400)
                    res.json({success: false, err})
                    res.end()
                }
                res.json({success: true, message: "Try to login now motherfucker"})
                res.end()
                return
            })
        } else if (user.mail == mail) {
            res.status(409)
            res.json({success: false, message: 'User already in the DB'})
            res.end()
            return
        }
    })
}

// router.post('/authenticate', login)
function login(req, res) {
    const mail = req.body.mail
    const password = req.body.password

    if (!mail || !password) {
        res.status(404)
        res.json({success: false, message: "mail || login blank"})
        res.end()
        return
    }

    User.findOne({
        mail: mail
    }, (err, user) => {

        if (err) {
            res.status(400)
            res.json({success: false, err})
            res.end()
            return
        }

        if (!user) {
            res.status(401)
            res.json({success: false, message: 'Authentication failed. User not found.'})
            res.end()
            return
        } else if (user) {
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
                } else {
                    // if user is found and password is right
                    // create a token
                    const token = jwt.sign(user, config.jwt.secret, {
                        expiresIn: "24h", // expires in 24 hours
                        algorithm: 'HS512'
                    });

                    res.json({success: true, token: token, userId: user.id, message: "Take my lord, this present is for you and only you"})
                    res.end()
                    return
                }
            })
        }
    })
}

// router.get('/profile/:userId', getProfile)
function getProfile(req, res) {
    const userId = req.params.userId

    User.findById(userId, "-password", (err, user) => {
        if (err) {
            res.status(404)
            res.json({success: false, err})
            res.end()
            return
        }

        if (!user) {
            res.status(400)
            res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
            res.end()
            return
        }

        res.json({success: true, user: user})
        res.end()
        return
    })
}

// router.patch('/profile/', update)
function update(req, res) {
    const userId = req.body.userId
    const update = req.body.update

    User.findByIdAndUpdate(userId, update, {
        new: true,
        select: '-password'
    }, (err, newUser) => {
        if (err) {
            res.json({success: false, err})
            res.end()
            return
        }

        if (!newUser) {
            res.status(401)
            res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
            res.end()
            return
        }

        res.json({success: true, user: newUser, message: `User userId :${userId} have been updated.`})
        res.end()
        return
    })
}

// router.delete('/profile/', deleteProfile)
function deleteProfile(req, res) {
    const userId = req.body.userId

    User.findByIdAndRemove(userId, (err, user) => {
        if (err) {
            res.json({success: false, err})
            res.end()
            return
        }

        if (!user) {
            res.status(401)
            res.json({success: false, message: `Cannot find an User with the userId: ${userId}`})
            res.end()
            return
        }

        res.json({success: true, message: `User with userId:${userId} have been remove from the DB`})
        res.end()
        return
    })
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
function addBike(req, res) {
    const userId = req.body.userId
    const bikeInfo = req.body.bikeInfo

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

        if (!bikeInfo.tracker) {
            res.status(401)
            res.json({success: false, message: 'Bike must have a Tracker ID'})
            res.end()
            return
        }

        const newBike = new Bike(bikeInfo)
        // const newBike = new Bike({name: bikeInfo.name, color: bikeInfo.color, brand: bikeInfo.brand, tracker: bikeInfo.tracker})

        newBike.save((err, b) => {
            if (err) {
                res.json({success: false, err})
                res.end()
                return
            }
            const bikeList = user.bikes
            bikeList.push(b.id)
            user.update({
                bikes: bikeList
            }, err => {
                if (err) {
                    res.json({success: false, err})
                    res.end()
                }
                res.json({
                  success: true,
                  bikeId: b.id,
                  message: `Added Bike: ${b.id} to UserId: ${userId}`
                })
                res.end()
            })
        })
    })
}

// router.get('/bike/:bikeId', getBikeInfo)
function getBikeInfo(req, res) {
    const bikeId = req.params.bikeId

    Bike.findById(bikeId, (err, bike) => {
        if (err) {
            res.status(404)
            res.json({success: false, err})
            res.end()
            return
        }

        if (!bike) {
            res.status(400)
            res.json({
              success: false,
              message: `Cannot find an Bike with the userId: ${bikeId}`
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
    })
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

module.exports = router
