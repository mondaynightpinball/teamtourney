'use strict';

const debug = require('debug')('mnp:tourney-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const server = require('../server.js');

const url = `http://localhost:${server.PORT}`;

describe('Tourney Routes', function() {
  before( done => {
    server.start().then( () => done());
  });
  before( done => {
    require('./lib/mock-venue.js')()
    .then( venue => {
      debug('VENUE:', venue);
      this.venue = venue;
      done();
    });
  });
  before( done => { // CREATE A MOCK ROOT USER
    require('./lib/mock-root.js')()
    .then( user => {
      this.root = user;
      done();
    });
  });
  after(require('./lib/clean-db.js'));

  describe('POST /api/tourney', () => {
    describe('as root user and valid body', () => {
      it('should return 201 and a new tourney', done => {
        request.post(`${url}/api/tourney`)
        .set({ Authorization: `Bearer ${this.root.token}` })
        .send({
          name: 'Example Tourney',
          venue: `${this.venue._id}`
          // TODO: What else do tourneys need?
        }).end( (err, res) => {
          expect(res.status).to.equal(201);
          this.tourney = res.body;
          done();
        });
      });
    }); // root and valid
  }); // POST /api/tourney

  describe('GET /api/tourney/:id', () => {
    describe('with a valid id', () => {
      it('should return a 200 with the tourney', done => {
        request.get(`${url}/api/tourney/${this.tourney._id}`)
        .end( (err, res) => {
          debug('TOURNEY:', res.body);
          expect(res.status).to.equal(200);
          expect(res.body._id).to.equal(`${this.tourney._id}`);
          expect(res.body.name).to.equal('Example Tourney');
          done();
        });
      });
    }); // valid id
  }); // GET /api/tourney/:id

  

});
