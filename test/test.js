process.env.NODE_ENV = 'test'
process.env.PORT = '3001'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server/index')

const User = require('../db_models/user')
const Bike = require('../db_models/bike')
const Tracker = require('../db_models/tracker')

const expect = chai.expect;
chai.use(chaiHttp);

const apiKey = process.env.API_KEY_APP

describe('\n => Test if server is up', function() {

    it(' -> should have a JSON {foo:\'bar\'} in the body', function(done) {
        chai.request(server).get('/').set('Authorization', apiKey).end((err, res) => {
            expect(res).to.have.status(200)
            expect(res).to.be.an("object")
            expect(res.body).to.include.keys("foo")
            expect(res.body).to.have.property('foo', 'bar');
            done()
        })
    })
})

describe('\n => Test API Key', function() {

    it(' -> should not accept a request without an API Key', function(done) {
        chai.request(server).get('/').end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.include.keys('success');
            expect(res.body).to.have.property('success', false);
            done()
        })
    })

    it(' -> should not accept a request with a wrong API Key', function(done) {
        chai.request(server).get('/').set('Authorization', 'wrongAPIKey!').end((err, res) => {
            expect(res).to.have.status(403)
            expect(res.body).to.include.keys('success');
            expect(res.body).to.have.property('success', false);
            done()
        })
    })
})


/*////////////////////////////
//                          //
//  Test on /profile route  //
//                          //
*/////////////////////////////



describe('\n => Test if a user can register and login proprely', function() {

    const email = 'john_doe@biketrack.eu'
    const password = 'qwerty123'
    let userId = ""
    let token = ""

    before(" => Delete User to DB if any at start\n", function() {
        User.findOneAndRemove({
            email
        }, err => {
            if (err)
                return err
            console.log('\n > User deleted before starting the test\n');
        })
    })

    after(" => Delete User to DB if any at the end\n", function() {
        User.findOneAndRemove({
            email
        }, err => {
            if (err)
                return err
            console.log('\n > User deleted after starting the test\n');
        })
    })

    describe('\n => Test /signup API route', function() {
        it(' -> shouldn\'t be able to log without a password\n', function(done) {
            chai.request(server).post('/signup').set('Authorization', apiKey).send({ email, 'password': ""}).end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'email || Password is blank');
                done()
            })
        })

        it(' -> shouldn\'t be able to log without a email\n', function(done) {
            chai.request(server).post('/signup').set('Authorization', apiKey).send({ email: "", 'password': password}).end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'email || Password is blank');
                done()
            })
        })

        it(' -> should signup for John Doe\n', function(done) {
            chai.request(server).post('/signup').set('Authorization', apiKey).send({ email, 'password': password}).end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('message', 'Try to login now motherfucker');
                done()
            })
        })

        it(' -> should not be able to signup again with the same email\n', function(done) {
            chai.request(server).post('/signup').set('Authorization', apiKey).send({ email, 'password': password}).end((err, res) => {
                expect(res).to.have.status(409)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'User already in the DB');
                done()
            })
        })

    })

    describe('\n => Test /authenticate route', function() {

        it(' -> shouldn\'t be able to login without a email', function(done) {
            chai.request(server).post('/authenticate').set('Authorization', apiKey).send({'email': "", 'password': password}).end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'email || login blank');
                done()
            })
        })

        it(' -> shouldn\'t be able to login without a password', function(done) {
            chai.request(server).post('/authenticate').set('Authorization', apiKey).send({'email': email, 'password': ""}).end((err, res) => {
                expect(res).to.have.status(404)
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'email || login blank');
                done()
            })
        })

        it(' -> shouldn\'t be able to log an unknown email', function(done) {
            chai.request(server).post('/authenticate').set('Authorization', apiKey).send({'email': "yolo@epitech.eu", 'password': password}).end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'Authentication failed. User not found.');
                done()
            })
        })

        it(' -> shouldn\'t be able to log a wrong password', function(done) {
            chai.request(server).post('/authenticate').set('Authorization', apiKey).send({'email': email, 'password': "password"}).end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.include.keys('success', 'message');
                expect(res.body).to.have.property('success', false);
                expect(res.body).to.have.property('message', 'Authentication failed. Wrong password.');
                done()
            })
        })

        it(' -> should login with John Doe credential\n', function(done) {
            chai.request(server).post('/authenticate').set('Authorization', apiKey).send({'email': email, 'password': password}).end((err, res) => {
                userId = res.body.userId
                token = res.body.token
                expect(res).to.have.status(200)
                expect(res.body).to.include.keys('success', 'message', 'token', 'userId');
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('message', 'Take my lord, this present is for you and only you');
                done()
            })
        })
    })

    describe('\n => Test /profile route', function() {

        it(' -> shouldn\'t find John Doe\'s profile with a wrong ID\n', function(done) {
            chai.request(server).get(`/profile/1`).set('Authorization', apiKey).set('x-access-token', token).end((err, res) => {
                expect(res).to.have.status(400)
                done()
            })
        })

        it(' -> should find John Doe\'s profile with ID\n', function(done) {
            chai.request(server).get(`/profile/${userId}`).set('Authorization', apiKey).set('x-access-token', token).end((err, res) => {
                expect(res).to.have.status(200)
                done()
            })
        })

        it(' -> should not update with a unknown userId\n', function(done) {
            chai.request(server).patch('/profile').set('Authorization', apiKey).set('x-access-token', token).send({
                'userId': '1',
                'update': {
                    'name': 'John Doe'
                }
            }).end((err, res) => {
                expect(res).to.have.status(401)
                done()
            })
        })

        it(' -> should update John Doe\'s profile with a new name\n', function(done) {
            chai.request(server).patch('/profile').set('Authorization', apiKey).set('x-access-token', token).send({
                'userId': userId,
                'update': {
                    'name': 'John Doe',
                    'toto': 'titi'
                }
            }).end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.include.keys("user")
                expect(res.body.user).to.include.keys("name")
                expect(res.body.user).to.have.property('name', 'John Doe');
                expect(res.body.user).to.not.include.keys("toto")
                done()
            })
        })

        it(' -> should not delete a profile with an unknown userId\n', function(done) {
            chai.request(server).delete('/profile').set('Authorization', apiKey).set('x-access-token', token).send({'userId': '1'}).end((err, res) => {
                expect(res).to.have.status(401)
                done()
            })
        })

        it(' -> should delete John Doe\'s profile\n', function(done) {
            chai.request(server).delete('/profile').set('Authorization', apiKey).set('x-access-token', token).send({'userId': userId}).end((err, res) => {
                expect(res).to.have.status(200)
                done()
            })
        })

    })

})



/*////////////////////////////
//                          //
//  Test on /bike route     //
//                          //
*/////////////////////////////



describe('\n => Test /bike/* route', function() {

    const userTest = new User({
      email: 'bike@biketrack.eu',
      password: 'qwerty123'
    })
    const bikeTest = {
        name: "My Bike",
        brand: "Giant",
        tracker: "1234567890"
    }
    let userId = ""
    let bikeId = ""
    let token = ""


    before("Add a Fake User to DB to simulate the action", function(done) {

      userTest.save((err, data) => {
        if (err)
            return done(err)
        userId = data._id

        chai.request(server)
        .post('/authenticate')
        .set('Authorization', apiKey)
        .send({
          'email': userTest.email,
          'password': 'qwerty123' // /!\ But WTF userTest.password isn't working !!!!!!!!
        })
        .end((err, res) => {
          token = res.body.token
          done()
        })
      })
    })

    after("Delete fake User to DB", function(done) {
        User.findOneAndRemove(userTest.email, err => {
            if (err)
                return done(err)
            console.log('User deleted from /bike test');
            done()
        })
    })

    it("should add a bike a the user john_doe@biketrack.eu", function(done) {
        chai.request(server)
        .post('/bike')
        .set('Authorization', apiKey)
        .set('x-access-token', token)
        .send({
          'userId': userId,
          'bikeInfo': bikeTest
        }).end((err, res) => {
            bikeId = res.body.bikeId
            expect(res).to.have.status(200)
            expect(res.body).to.include.keys('success', 'message');
            expect(res.body).to.have.property('success', true);
            done()
        })
    })

    it("should get the previous recorded bike info", function(done) {
        chai.request(server)
        .get(`/bike/${bikeId}`)
        .set('Authorization', apiKey)
        .set('x-access-token', token)
        .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.include.keys('success');
            expect(res.body).to.have.property('success', true);
            done()
        })
    })

    it("should update the previous recorded bike info", function(done) {
      chai.request(server)
      .patch(`/bike/`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({
          'bikeId': bikeId,
          'update': {
              'brand': 'Specialiazed'
          }
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.include.keys('success');
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.include.keys('bike');
        expect(res.body).to.deep.property('bike.brand', 'Specialiazed');
        // expect(res.body).to.have.property('color', 'Black');
        done()
      })
    })

    it("should delete the previous recorded bike info", function(done) {
      chai.request(server)
      .delete(`/bike/`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({
        'userId': userId,
        'bikeId': bikeId
      })
      .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.include.keys('success');
          expect(res.body).to.have.property('success', true);
          done()
      })
    })
  })


/*////////////////////////////
//                          //
//  Test on /tracker route  //
//                          //
*/////////////////////////////


// describe('\n => Test /tracker/* route', function() {
//
//   const userTest = new User({
//     email: 'tracker@biketrack.eu',
//     password: 'qwerty123'
//   })
//   const bikeTest = new Bike({
//       name: "My Bike",
//       color: "Red",
//       brand: "Giant",
//       tracker: "1234567890"
//   })
//   let trackerUserId = ""
//   let trackerBikeId = ""
//   let trackerId = ""
//   let trackerToken = ""
//
//   before("Add a Fake User to DB to simulate the action", function(done) {
//     userTest.save((err, data) => {
//       if (err)
//           return done(err)
//       trackerUserId = data._id
//
//       chai.request(server)
//       .post('/authenticate')
//       .set('Authorization', apiKey)
//       .send({
//         'email': userTest.email,
//         'password': 'qwerty123' // /!\ But WTF userTest.password isn't working !!!!!!!!
//       })
//       .end((err, res) => {
//         trackerToken = res.body.token
//         bikeTest.save((err, bikeData) => { // change with a chai request to have the bike recorded into the user account
//           if (err) return err
//           trackerBikeId = bikeData._id
//           done()
//         })
//       })
//     })
//   })
//
//   after("Delete fake User to DB", function(done) {
//     console.log(`User ID = ${trackerUserId}`);
//       Tracker.findByIdAndRemove(trackerId, (err, t) => {
//           if (err) return done(err)
//           else if (!t) {
//             console.log('404 Tracker not found');
//
//           }
//           else {
//             console.log('Tracker deleted');
//           }
//
//       })
//
//       Bike.findByIdAndRemove(trackerBikeId, (err, b) => {
//           if (err) return done(err)
//           else if (!b) {
//             console.log('404 Bike not found');
//           }
//           else {
//             console.log('Bike deleted');
//           }
//       })
//
//       User.findOneAndRemove(trackerUserId, (err, u) => {
//           if (err) return done(err)
//           else if (!u) {
//             console.log('404 User not found');
//           }
//           else {
//             console.log('User deleted');
//           }
//       })
//       done()
//   })
//
//
//   it(`should add a tracker to the bike ${trackerBikeId}`, function(done) {
//     // console.log(`Bike ID Before request : ${trackerBikeId}`);
//     chai.request(server)
//     .post("/tracker")
//     .set('Authorization', apiKey)
//     .set('x-access-token', trackerToken)
//     .send({
//       'bikeId': trackerBikeId,
//       'trackerInfo': {
//         '_id': 'testId',
//         'locations': [{
//           coordinates: [42, 17, 26],
//           timestamp: Date.now,
//         }]
//       }
//     })
//     .end((err, res) => {
//       trackerId = res.body.trackerId
//       expect(res).to.have.status(200)
//       expect(res.body).to.include.keys('success', 'message')
//       expect(res.body).to.have.property('success', true)
//       done()
//     })
//   })
// })
