const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const User = require('../db_models/user')
const Bike = require('../db_models/bike')
const config = require('../config/')
const bcrypt = require('bcrypt')
// const crypt = require('../config/crypt')

// const apiKey = require('../config/apiKey');
// router.use(apiKey);

// Test
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json(
    { foo: 'bar'}
  )
  // res.send('Hello, World!')
})

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
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
})

router.get('/profile/:userId', getProfile) // cRud login
router.put('/profile/', update) // crUd login
router.delete('/profile/', deleteProfile) // cruD login

// router.post('/authenticate/facebook', authFacebook) // crUd* login
// router.post('/authenticate/google', authGoogle) // crUd* login
// router.put('/profile/facebook/:userId', addFacebook) // crUd* login
// router.put('/profile/google/:userId', addGoogle) // crUd* login

router.get('/bike/list/:id', getBikeList) // get list ID [Bike], check details to bike DB
router.post('/bike/', addBike) // Crud bike
router.get('/bike/', getBikeInfo) // cRud bike
router.put('/bike/', updateBike) // crUd bike
router.delete('/bike/', deleteBike) // cruD bike
router.delete('/tracker/', deleteTracker) // unpair tracker from a bike {id}
router.put('/tracker/', updateTracker) // update tracker info from a bike
router.get('/bike/:id/map', mapInfo) // get the last {map} info from a bike {id}
router.post('/alert', alert) // send alert to server (don't know how to make it work)
router.get('/settings/', getSettings)
router.put('/settings/', updateSettings)

// router.post('/signup', signup)
function signup(req, res) {
  const mail = req.body.mail
  const password = req.body.password //sha256 or bcrypt

  if (!mail || !password) {
    res.status(404)
    res.json({
      success: false,
      message: "mail || login blank"
    })
    res.end()
    return
  }

  User.findOne({
    mail
  }, (err, user) => {
    if (err) {
      res.status(400)
      res.json({
        success: false,
        err
      })
      res.end()
      return
    }

    else if (!user){
      const newUser = new User({
        mail: mail,
        password: password
      })
      newUser.save( err => {
        if (err) {
          res.status(400)
          res.json({
            success: false,
            err
          })
          res.end()
        }
        res.json({
          success: true,
          message: "Try to log now motherfucker"
        })
        res.end()
        return
      })
    }
    else if (user.mail == mail) {
      res.status(401)
      res.json({
        success: false,
        message: 'User already in the DB.'
      })
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
    res.json({
      success: false,
      message: "mail || login blank"
    })
    res.end()
    return
  }

  User.findOne ({
    mail: mail
  }, (err, user) => {

    if (err) {
      res.status(400)
      res.json({
        success: false,
        err
      })
      res.end()
      return
    }

    if (!user) {
      res.status(401)
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      })
      res.end()
      return
    } else if (user) {
      const testPassword = user.comparePassword(password, (err, isMatch) => {
        if (err) {
          res.status(400)
          res.json({
            success: false,
            err
          })
          res.end()
          return
        } else if (!isMatch) {
          res.status(401)
          res.json({
            success: false,
            message: "Authentication failed. Wrong password."
          })
          res.end()
          return
        } else {
          // if user is found and password is right
          // create a token
          const token = jwt.sign(user, config.jwt.secret, {
            expiresIn: "24h", // expires in 24 hours
            algorithm: 'HS512'
          });

          res.json({
            success: true,
            token: token,
            userId: user.id,
            message: "Take my lord, this present is for you and only you"
          })
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
      console.log(err);
      res.status(404)
      res.json({
        success: false,
        err
      })
      res.end()
      return
    }

    if (!user) {
      res.status(400)
      res.json({
        success: false,
        message: `Cannot find an User with the userId: ${userId}`
      })
      res.end()
      return
    }

    res.json({
      success: true,
      user: user
    })
    res.end()
    return
  })
}

// router.put('/profile/', update)
function update(req, res) {
  const userId = req.body.userId
  const update = req.body.update

  User.findByIdAndUpdate(userId, update, { new: true, select: '-password' },  (err, newUser) => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
      return
    }

    if (!newUser) {
      res.status(401)
      res.json({
        success: false,
        message: `Cannot find an User with the userId: ${userId}`
      })
      res.end()
      return
    }

    res.json({
      success: true,
      user: newUser,
      message: `User userId :${userId} have been updated.`
    })
    res.end()
    return
  })
}

// router.delete('/profile/', deleteProfile)
function deleteProfile(req, res) {
  const userId = req.body.userId

  User.findByIdAndRemove(userId, (err, user) => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
      return
    }

    if (!user) {
      res.status(401)
      res.json({
        success: false,
        message: `Cannot find an User with the userId: ${userId}`
      })
      res.end()
      return
    }

    res.json({
      success: true,
      message: `User with userId:${userId} have been remove from the DB`
    })
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

// router.get('/bike/list/:id', getBikeList)
function getBikeList(req, res) {
  const userId = req.params.userId

  User.findById(userId, (err, user) => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
    }

    const bikeList = user.bikes
    if (bikeList.length() == 0) {
      res.json({
        success: false,
        message: `The list is empty for userId: ${userId}`
      })
      res.end()
    }
    viewList = []
    bikeList.forEach(bikeId => {
      Bike.findById(bikeId, "name color brand", (err, bike) => {
        if (err) {
          res.json({
            success: false,
            err
          })
          res.end()
        }
        viewList.append(bike)
      })
    })
    res.json({
      success: true,
      bikeList: viewList
    })
    res.end()
  })
}

// router.post('/bike/:id', addBike)
function addBike(req, res) {
  const userId = req.params.userId
  const bike = req.body.bike

  User.findById(userId, (err, user) => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
    }

    const newBike = new Bike({
      name: bike.name,
      color: bike.color,
      brand: bike.brand,
      tracker: bike.tracker
    })

    newBike.save( (err, b) => {
      if (err) {
        res.json({
          success: false,
          err
        })
        res.end()
      }
      const bikeList = user.bikes
      bikeList.append(b.id)
      user.update({bike: bikeList}, err => {
        if (err) {
          res.json({
            success: false,
            err
          })
          res.end()
        }
        res.json({
          success: true,
          message: `Added Bike: ${b.id} to UserId: ${userId}`
        })
        res.end()
      })
    })
  })
}

// router.get('/bike/:id', getBikeInfo)
function getBikeInfo(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.delete('/bike/:id', deleteBike)
function deleteBike(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.put('/bike/:id', updateBike)
function updateBike(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.delete('/tracker/:id', deleteTracker)
function deleteTracker(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.put('/tracker/:id', updateTracker)
function updateTracker(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.get('/bike/:id/map', mapInfo)
function mapInfo(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.post('/alert', alert)
function alert(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.get('/settings/:id', getSettings)
function getSettings(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

// router.put('/settings/:id', updateSettings)
function updateSettings(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({ Test: '1234' })
}

module.exports = router
