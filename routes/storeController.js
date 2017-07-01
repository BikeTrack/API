const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('../config/')
const bcrypt = require('bcrypt')
const User = mongoose.model('User')
const Bike = mongoose.model('Bike')
const Tracker = mongoose.model('Tracker')


/*////////////////////////////
//                          //
//  Function /signup route  //
//                          //
*/////////////////////////////

// router.post('/signup', signup)
exports.signup = async (req, res) => {
  const { mail, password } = req.body
  console.log((req.body));

  if (!mail || !password) {
      res.status(404)
      res.json({success: false, message: "Mail || Password is blank"})
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
    const newUser = new User(req.body)
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
  const { mail, password } = req.body

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



/*////////////////////////////
//                          //
//  Function /profile route //
//                          //
*/////////////////////////////

// router.get('/profile/:userId', getProfile)
exports.getProfile = async (req, res) => {
  const { userId } = req.params

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
exports.updateProfile = async (req, res) => {
  const { userId, update } = req.body

  console.log('YOoooOOoloOOoOooO');

  try {
    const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    runValidators: true,
    select: '-password'
  }).exec()

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
  const { userId } = req.body

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
  const { userId, bikeInfo } = req.body

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
  const { bikeId } = req.params

  try {
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
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.patch('/bike/', updateBike)
exports.updateBike = async (req, res) => {
  const { bikeId, update } = req.body

  try {
  const bike = await Bike.findByIdAndUpdate(bikeId, update, {new: true} )
  if (!bike) {
        res.status(401)
        res.json({
          success: false,
          message: `No Bike with this ID ${bikeId} found`
        })
        res.end()
        return
    }

    res.json({success: true, bike: bike, message: `Bike updated`})
    res.end()
    return
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.delete('/bike/', deleteBike)
exports.deleteBike = async (req, res) => {
  const { userId, bikeId } = req.body

  try {
    const user = await User.findById(userId)
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

    await user.update({
      bikes: newBikeList
    })

    const bike = await Bike.findByIdAndRemove(bikeId)
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

  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}



/*////////////////////////////
//                          //
//  Function /tracker route //
//                          //
*/////////////////////////////

// router.post('/tracker', addTracker)
exports.addTracker = async (req, res) => {
  const { bikeId, trackerInfo } = req.body

  try {
    const bike = await Bike.findById(bikeId)

    if (!bike) {
      res.status(401)
      res.json({
        success: false,
        message: `No Bike with this ID ${bikeId} found`
      })
      res.end()
      return
    } else {
      const newTracker = await (new Tracker(trackerInfo)).save()
      const trackerId = newTracker._id
      bike.update({ tracker: trackerId })
      res.json({
        success: true,
        trackerId: newTracker.id,
        message: `Added Tracker: ${newTracker.id} to Bike: ${bikeId}`
      })
      res.end()
    }
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.get('/tracker/:trackerId', storeController.addTracker)
exports.getTracker = async (req, res) => {
  const { trackerId } = req.params

  try {
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
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

// router.delete('/tracker/', deleteTracker)
exports.deleteTracker = async (req, res) => {
  const { bikeId, trackerId } = req.body

  try {
    const bike = await Bike.findById(bikeId)

    if (!bike){
      res.status(401)
      res.json({
        success: false,
        message: `No Bike with this ID ${bikeId} found`
      })
      res.end()
      return

    } else {

      if (trackerId !== bike.tracker) {
        res.status(401)
        res.json({
          success: false,
          message: `Cannot find a tracker with this ID : ${trackerId} for this Bike`
        })
        res.end()
        return
      }

      await bike.update({ trackers: "" })
      res.json({
        success: true,
        message: `Tracker with trackerId: ${trackerId} have been remove the User and Bike DB`
      })
      res.end()
      return
    }

  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }



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

// router.patch('/tracker/', updateTracker)
exports.updateTracker = async (req, res) => {
  const { trackerId, gps } = req.body

  // add check on gps valid format
  try {
    const tracker = await Tracker.findById(trackerId)
    if (!tracker) {
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
      bike: tracker,
      message: `Tracker updated`
    })
    res.end()
    return
  } catch (e) {
    res.status(400)
    console.error(e);
    res.json({success: false, e})
    res.end()
  }
}

/*//////////////////////////////
//                            //
//  Function /biketrack route //
//                            //
*///////////////////////////////

exports.biketrack = async (req, res) => {
  
}