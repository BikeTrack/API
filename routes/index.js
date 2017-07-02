const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()

const User = require('../db_models/user')
const Bike = require('../db_models/bike')
const Tracker = require('../db_models/tracker')
const config = require('../config/')
const bcrypt = require('bcrypt')

const storeController = require('./storeController');

//Test
router.get('/', storeController.test)


/*////////////////////////////
//                          //
//  Function /signup route  //
//                          //
*/////////////////////////////

router.post('/signup', storeController.signup) // Crud login
router.post('/authenticate', storeController.login) // cRud login

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

/*////////////////////////////
//                          //
//  Function /profile route //
//                          //
*/////////////////////////////

router.get('/profile/:userId', storeController.getProfile) // cRud login
router.patch('/profile/', storeController.updateProfile) // crUd login
router.delete('/profile/', storeController.deleteProfile) // cruD login

// router.post('/authenticate/facebook', authFacebook) // crUd* login
// router.post('/authenticate/google', authGoogle) // crUd* login
// router.put('/profile/facebook/:userId', addFacebook) // crUd* login
// router.put('/profile/google/:userId', addGoogle) // crUd* login

/*////////////////////////////
//                          //
//  Function /bike route    //
//                          //
*/////////////////////////////

router.post('/bike/', storeController.addBike) // Crud bike
router.get('/bike/:bikeId', storeController.getBikeInfo) // cRud bike
router.patch('/bike/', storeController.updateBike) // crUd bike
router.delete('/bike/', storeController.deleteBike) // cruD bike

/*////////////////////////////
//                          //
//  Function /tracker route //
//                          //
*/////////////////////////////

router.post('/tracker/', storeController.addTracker)
router.get('/tracker/:trackerId', storeController.getTracker)
router.delete('/tracker/', storeController.deleteTracker) // unpair tracker from a bike {id}
router.patch('/tracker/', storeController.updateTracker) // update tracker info from a bike

/*//////////////////////////////
//                            //
//  Function /biketrack route //
//                            //
*///////////////////////////////

router.post('/biketrack', storeController.biketrack)

module.exports = router
