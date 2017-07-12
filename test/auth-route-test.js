'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const User = require('../model/user.js');

const exampleUser = {
  username: 'theexampleplayer',
  email: 'somebody@example.com',
  password: '123abc'
};

const server = require('../server.js');

const url = `http://localhost:${server.PORT}`;

function cleanup(done) {
  User.remove({})
  .then( () => done())
  .catch(done);
}

describe('Auth Routes', function() {
  this.timeout(0); //It takes a while to spin up the server.
  before( done => {
    server.start().then( () => done());
  });

  describe('GET /some/bogus/route', function() {
    it('should return a 404', done => {
      request.get(`${url}/some/bogus/route`)
      .end( (err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  }); // Bogus Routes

  describe('POST /api/signup', function() {
    describe('with a valid body', function() {
      after( done => cleanup(done));

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end( (err, res) => {
          if(err) done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    }); // valid body

    describe('with a missing username', function() {
      after( done => cleanup(done)); //Just in case?

      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send({ email: exampleUser.email, password: exampleUser.password })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing username

    describe('with a missing password', function() {
      after( done => cleanup(done)); //Just in case?

      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send({ username: exampleUser.username, email: exampleUser.email })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing password

    describe('with a missing email', function() {
      after( done => cleanup(done)); //Just in case?

      it('should return a 400', done => {
        request.post(`${url}/api/signup`)
        .send({ username: exampleUser.username, password: exampleUser.password })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing email

  }); // POST /api/signup

  describe('GET /api/signin', function() {
    before( done => {
      let user = new User(exampleUser);
      user.generatePasswordHash(exampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        done();
      });
    });

    after( done => cleanup(done));

    describe('with a valid username and password', () => {
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.username, exampleUser.password)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    }); // valid username and password

    describe('with incorrect password', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth(exampleUser.username, 'not_the_real_password')
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); // incorrect password

    describe('unknown username', () => {
      it('should return a 401', done => {
        request.get(`${url}/api/signin`)
        .auth('not_a_user', exampleUser.password)
        .end( (err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    }); //unknown username
  }); // GET /api/signin
});
