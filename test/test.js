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
      expect(res.body).to.have.keys("foo")
      expect(res.body.foo).to.eql("bar")
      done()
    })
  })
})

describe('Test user signup and login', () => {

  const mail = 'john_doe@biketrack.eu'
  const password = 'qwerty123'
  let userId = ""


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
    it('should find Joe Doe\'s profile with ID\n', (done) => {
      chai.request(server)
      .get(`/profile/${userId}`)
      .end((err, res) => {
        expect(res).to.have.status(200)
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
