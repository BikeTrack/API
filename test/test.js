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


describe('Test if server is up', function() {

  it('should have a JSON {foo:\'bar\'} !', function(done) {
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

describe('Test User response to database', function() {

  const mail = 'john_doe@biketrack.eu'
  const password = 'qwerty123'
  let userId = ""
  let token = ""

  before("Delete User to DB if any at start", function() {
    User.findOneAndRemove({'mail': mail}, err => {
      if (err) return console.log(err)
      console.log('User deleted');
    })
  })

  after("Delete User to DB if any at the end", function() {
    User.findOneAndRemove({'mail': mail}, err => {
      if (err) return console.log(err)
      console.log('User deleted');
    })
  })

  describe('Test /signup route' , function() {
    it('shouldn\'t be able to log without a password\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
    })

    it('shouldn\'t be able to log without a mail\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
    })

    it('should signup for John Doe\n', function(done) {
      chai.request(server)
      .post('/signup')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })
  })

  describe('Test /authenticate route', function() {

    it('shouldn\'t be able to login without a mail', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done()
      })
    })

    it('shouldn\'t be able to login without a password', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done()
      })
    })

    it('shouldn\'t be able to login an unknown mail', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': "yolo@epitech.eu",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done()
      })
    })

    it('shouldn\'t be able to login a wrong password', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': "password"
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done()
      })
    })

    it('should login John Doe\n', function(done) {
      chai.request(server)
      .post('/authenticate')
      .set('Authorization', apiKey)
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
        const text = JSON.parse(res.text)
        userId = text.userId
        token = text.token
        expect(res).to.have.status(200)
        done()
      })
    })
  })

  describe('Test /profile route', function() {

    it('shouldn\'t find John Doe\'s profile with a wrong ID\n', function(done) {
      chai.request(server)
      .get(`/profile/1`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
    })

    it('should find John Doe\'s profile with ID\n', function(done) {
      chai.request(server)
      .get(`/profile/${userId}`)
      .set('Authorization', apiKey)
      .set('x-access-token', token)
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })

    it('should not update with a unknown userId\n', function(done) {
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

    it('should update John Doe\'s profile his name\n', function(done) {
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

    it('should not delete a profile with an unknown userId\n', function(done) {
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

    it('should delete John Doe\'s profile\n', function(done) {
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

describe('Test /bike/* route', function() {

  const user = new User({
    mail: 'john_doe@biketrack.eu',
    password: 'qwerty123'
  })

  before("Add a Fake User to DB to simulate the action", function() {
    user.save( err => {
      if (err) return console.log(err);
      console.log(user);
    })
  })

  after("Delete fake User to DB", function() {
    User.findOneAndRemove(user.mail, err => {
      if (err) return console.log(err)
      console.log('User deleted');
    })
  })


})
