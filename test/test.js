process.env.NODE_ENV = 'test'
process.env.PORT = '3001'

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const User = require('../db_models/user')
const Bike = require('../db_models/bike')

// const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const apiKey = process.env.API_KEY_APP


describe('\n => Test if server is up', function() {

  it(' -> should have a JSON {foo:\'bar\'} in the body', function(done) {
    chai.request(server)
    .get('/')
    .set('Authorization', apiKey)
    .end((err, res) => {
      expect(res).to.have.status(200)
      expect(res).to.be.an("object")
      expect(res.body).to.include.keys("foo")
      expect(res.body).to.have.property('foo', 'bar');
      done()
    })
  })
})

describe('\n => Test API Key', function () {

  it(' -> should not accept a request without an API Key', function(done) {
    chai.request(server)
    .get('/')
    .end((err, res) => {
      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('success');
      expect(res.body).to.have.property('success', false);
      done()
    })
  })

  it(' -> should not accept a request with a wrong API Key', function(done) {
    chai.request(server)
    .get('/')
    .set('Authorization', 'wrongAPIKey!')
    .end((err, res) => {
      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('success');
      expect(res.body).to.have.property('success', false);
      done()
    })
  })

})

describe('\n => Test if a user can register and login proprely', function() {

  const mail = 'john_doe@biketrack.eu'
  const password = 'qwerty123'
  let userId = ""
  let token = ""

  before(" => Delete User to DB if any at start\n", function() {
    User.findOneAndRemove({'mail': mail}, err => {
      if (err) return err
      console.log('\n > User deleted before starting the test\n');
    })
  })

  after(" => Delete User to DB if any at the end\n", function() {
    User.findOneAndRemove({'mail': mail}, err => {
      if (err) return err
      console.log('\n > User deleted after starting the test\n');
    })
  })

  describe('\n => Test /signup API route' , function() {
    it(' -> shouldn\'t be able to log without a password\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'mail || login blank');
        done()
      })
    })

    it(' -> shouldn\'t be able to log without a mail\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'mail || login blank');
        done()
      })
    })

    it(' -> should signup for John Doe\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', true);
        expect(res.body).to.have.property('message', 'Try to log now motherfucker');
        done()
      })
    })

    it(' -> should not be able to signup again with the same email\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(401)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'User already in the DB.');
        done()
      })
    })

  })

  describe('\n => Test /authenticate route', function() {

    it(' -> shouldn\'t be able to login without a mail', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'mail || login blank');
        done()
      })
    })

    it(' -> shouldn\'t be able to login without a password', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'mail || login blank');
        done()
      })
    })

    it(' -> shouldn\'t be able to log an unknown mail', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': "yolo@epitech.eu",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'Authentication failed. User not found.');
        done()
      })
    })

    it(' -> shouldn\'t be able to log a wrong password', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': "password"
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.include.keys('success', 'message');
        expect(res.body).to.have.property('success', false);
        expect(res.body).to.have.property('message', 'Authentication failed. Wrong password.');
        done()
      })
    })

    it(' -> should login with John Doe credential\n', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
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
      chai.request(server)
      .get(`/profile/1`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
    })

    it(' -> should find John Doe\'s profile with ID\n', function(done) {
      chai.request(server)
      .get(`/profile/${userId}`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })

    it(' -> should not update with a unknown userId\n', function(done) {
      chai.request(server)
      .put('/profile')
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({
        'userId': '1',
        'update': {'name' : 'John Doe'}
      })
      .end((err, res) => {
        expect(res).to.have.status(401)
        done()
        })
    })

    it(' -> should update John Doe\'s profile with a new name\n', function(done) {
      chai.request(server)
      .put('/profile')
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({
        'userId': userId,
        'update': {'name' : 'John Doe', 'toto':'titi'}
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.body).to.include.keys("user")
        expect(res.body.user).to.include.keys("name")
        expect(res.body.user).to.have.property('name', 'John Doe');
        expect(res.body.user).to.not.include.keys("toto")
        done()
        })
    })

    it(' -> should not delete a profile with an unknown userId\n', function(done) {
      chai.request(server)
      .delete('/profile')
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({'userId': '1'})
      .end((err, res) => {
        expect(res).to.have.status(401)
        done()
      })
    })

    it(' -> should delete John Doe\'s profile\n', function(done) {
      chai.request(server)
      .delete('/profile')
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .send({'userId': userId})
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })

  })

})

describe('\n => Test /bike/* route', function() {

  const user = new User({
    mail: 'john_doe@biketrack.eu',
    password: 'qwerty123'
  })

  before("Add a Fake User to DB to simulate the action", function() {
    user.save( err => {
      if (err) return err
      console.log(user);
    })
  })

  after("Delete fake User to DB", function() {
    User.findOneAndRemove(user.mail, err => {
      if (err) return err
      console.log('User deleted');
    })
  })


})
