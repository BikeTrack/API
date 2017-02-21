process.env.NODE_ENV = 'test';
process.env.PORT = '3001'

const chai = require('chai');
// import chai from 'chai'
const chaiHttp = require('chai-http');
// import chaiHttp from 'chai-http'
const mongoose = require('mongoose');
// import mongoose from 'mongoose'
const server = require('../app');
// import server from '../app'

// const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);


describe('Test server', () => {

  it('should have a JSON {foo:\'bar\'} !', (done) => {
    chai.request(server)
    .get('/')
    .end((err, res) => {
      expect(res).to.have.status(200)
      expect(res).to.be.an("object")
      expect(res.body).to.include.keys("foo")
      expect(res.body).to.have.property('foo', 'bar');
      done()
    })
  })
})

describe('Test user signup and login', () => {

  const mail = 'john_doe@biketrack.eu'
  const password = 'qwerty123'
  let userId = ""
  const unknownId = "1234567890abcdef12345678"


  describe('Test /signup route' , () => {
    it('shouldn\'t be able to log without a password\n', (done) => {
      chai.request(server)
      .post('/signup')
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
    })

    it('shouldn\'t be able to log without a mail\n', (done) => {
      chai.request(server)
      .post('/signup')
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404)
        done()
      })
    })

    it('should signup for John Doe\n', (done) => {
      chai.request(server)
      .post('/signup')
      .send({
        'mail': 'john_doe@biketrack.eu',
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })
  })

  describe('Test /authenticate route', () => {

    it('shouldn\'t be able to login without a mail', (done) => {
      chai.request(server)
      .post('/authenticate')
      .send({
        'mail': "",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done()
      })
    })

    it('shouldn\'t be able to login without a password', (done) => {
      chai.request(server)
      .post('/authenticate')
      .send({
        'mail': mail,
        'password': ""
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        done()
      })
    })

    it('shouldn\'t be able to login an unknown mail', (done) => {
      chai.request(server)
      .post('/authenticate')
      .send({
        'mail': "yolo@epitech.eu",
        'password': password
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done()
      })
    })

    it('shouldn\'t be able to login a wrong password', (done) => {
      chai.request(server)
      .post('/authenticate')
      .send({
        'mail': mail,
        'password': "password"
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done()
      })
    })

    it('should login John Doe\n', (done) => {
      chai.request(server)
      .post('/authenticate')
      .send({
        'mail': mail,
        'password': password
      })
      .end((err, res) => {
        const text = JSON.parse(res.text)
        userId = text.userId
        expect(res).to.have.status(200)
        done()
      })
    })
  })

  describe('Test /profile route', () => {

    it('shouldn\'t find John Doe\'s profile with a wrong ID\n', (done) => {
      chai.request(server)
      .get('/profile/${unknownId}')
      .end((err, res) => {
        expect(res).to.have.status(400)
        done()
      })
    })

    it('should find John Doe\'s profile with ID\n', (done) => {
      chai.request(server)
      .get(`/profile/${userId}`)
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })

    it('should not update with a unknown userId\n', (done) => {
      chai.request(server)
      .put('/profile')
      .send({
        'userId': unknownId,
        'update': {'name' : 'John Doe'}
      })
      .end((err, res) => {
        expect(res).to.have.status(401)
        done()
        })
    })

    it('should update John Doe\'s profile his name\n', (done) => {
      chai.request(server)
      .put('/profile')
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

    it('should not delete a profile with an unknown userId\n', (done) => {
      chai.request(server)
      .delete('/profile')
      .send({'userId': unknownId})
      .end((err, res) => {
        expect(res).to.have.status(401)
        done()
      })
    })

    it('should delete John Doe\'s profile\n', (done) => {
      chai.request(server)
      .delete('/profile')
      .send({'userId': userId})
      .end((err, res) => {
        expect(res).to.have.status(200)
        done()
      })
    })

  })

})
