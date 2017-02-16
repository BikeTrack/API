const express = require('express')
const router = express.Router()

const User = require('../db_models/user')
const Bike = require('../db_models/bike')

// Test
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.json({ foo: 'bar' })
  // res.send('Hello, World!')
})

router.post('/signup', signup) // Crud login
router.post('/authenticate', login) // cRud login
router.delete('/profile/', deleteProfile) // cruD login
router.get('/profile/:userId', getProfile) // cRud login
router.put('/profile/:userId', update) // crUd login

// router.post('/authenticate/facebook', authFacebook) // crUd* login
// router.post('/authenticate/google', authGoogle) // crUd* login
// router.put('/profile/facebook/:userId', addFacebook) // crUd* login
// router.put('/profile/google/:userId', addGoogle) // crUd* login

router.get('/bike/list/:id', getBikeList) // get list ID [Bike], check details to bike DB
router.post('/bike/:id', addBike) // Crud bike
router.get('/bike/:id', getBikeInfo) // cRud bike
router.put('/bike/:id', updateBike) // crUd bike
router.delete('/bike/:id', deleteBike) // cruD bike
router.delete('/tracker/:id', deleteTracker) // unpair tracker from a bike {id}
router.put('/tracker/:id', updateTracker) // update tracker info from a bike
router.get('/bike/:id/map', mapInfo) // get the last {map} info from a bike {id}
router.post('/alert', alert) // send alert to server (don't know how to make it work)
router.get('/settings/:id', getSettings)
router.put('/settings/:id', updateSettings)

// router.post('/signup', signup)
function signup(req, res) {
  const mail = req.body.mail
  const password = req.body.password //sha256 or bcrypt
  console.log(`Mail : ${mail}\nPassword : ${password}\n`)
  if (!mail || !password) {
    res.status(404)
    res.json({
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
  const password = req.body.password //sha256 or bcrypt

  if (!mail || !password) {
    res.status(404)
    res.json({
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
      if (user.password != password) {
        res.status(401)
        res.json({
          success: false,
          message: "Authentication failed. Wrong password."
        })
        res.end()
        return
      } else {
        const tempToken = "1234567890"
        res.json({
          success: true,
          Test: '1234',
          Token: tempToken,
          userId: user.id
        })
        res.end()
        return
      }
    }
  })
}

// router.delete('/profile/', deleteProfile)
function deleteProfile(req, res) {
  const userId = req.body.userId

  User.findByIdAndRemove(userId, err => {
    if (err) {
      res.json({
        success: false,
        err
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

// router.put('/profile/:userId', update)
function update(req, res) {
  const userId = req.params.userId
  const update = req.body.update

  User.findByIdAndUpdate(userId, update, err => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
    }

    res.json({
      success: true,
      message: `User userId :${userId} have been updated.`
    })
    res.end()
  })
}

// router.get('/profile/:userId', getProfile)
function getProfile(req, res) {
  const userId = req.params.userId

  User.findById(userId, "-password", (err, user) => {
    if (err) {
      res.json({
        success: false,
        err
      })
      res.end()
    }

    if (!user) {
      res.json({
        success: false,
        message: `Cannot find an User with the userId: ${userId}`
      })
      res.end()
    }

    res.json({
      success: true,
      user: user
    })
    res.end()

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
