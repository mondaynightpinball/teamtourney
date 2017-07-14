'use strict';

const debug = require('debug')('mnp:venue-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const Machine = require('../model/machine.js');

const server = require('../server.js');

const url = `http://localhost:${server.PORT}`;

describe('Venue Routes', function() {
  before( done => {
    server.start().then( () => done());
  });
  before( done => { // CREATE A MOCK ROOT USER
    require('./lib/mock-root.js')()
    .then( user => {
      this.root = user;
      done();
    });
  });
  before( done => {
    require('./lib/mock-user.js')()
    .then( user => {
      this.rando = user;
      done();
    });
  });
  after(require('./lib/clean-db.js'));
  // after( done => serverToggle.stop(server, done));

  describe('POST /api/venue', () => {
    describe('as root user and valid body', () => {
      it('should return 201 and a new venue', done => {
        request.post(`${url}/api/venue`)
        .set({ Authorization: `Bearer ${this.root.token}` })
        .send({
          name: 'Example Venue',
          code: 'VEN'
        })
        .end( (err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.name).to.equal('Example Venue');
          //TODO: Expect more
          this.venue = res.body;
          done();
        });
      });
    }); // as root and valid body

    describe('as unauthorized user and valid body', () => {
      it('should return 403', done => {
        request.post(`${url}/api/venue`)
        .set({ Authorization: `Bearer ${this.rando.token}` })
        .send({
          name: 'AAA Venue',
          code: 'AAA'
        })
        .end( (err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
      });
    }); // as unauthorized and valid body

  }); // POST /api/venue

  describe('GET /api/venue/:id', () => {
    describe('with a valid id', () => {
      it('should return a venue', done => {
        request.get(`${url}/api/venue/${this.venue._id}`)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(this.venue.name);
          done();
        });
      });
    }); // valid id
  }); // GET /api/venue/:id

  describe('PUT /api/venue/:id/machine', () => {
    before( done => {
      new Machine({
        name: 'Attack From Mars',
        code: 'AFM'
      }).save()
      .then( machine => {
        this.machine = machine;
        done();
      });
    });
    describe('as root user and valid machine', () => {
      it('should add the machine to the venue', done => {
        request.put(`${url}/api/venue/${this.venue._id}/machine`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send({ machineId: this.machine._id.toString() })
        .end( (err, res) => {
          expect(res.status).to.equal(202);
          debug(res.body);
          expect(res.body.machines).to.be.an('array');
          expect(res.body.machines[0]).to.equal(this.machine._id.toString());
          done();
        });
      });
    }); // as root and valid machine
  }); // PUT /api/venue/:id/machine

  describe('DELETE /api/venue/:id/machine/:machineId', () => {
    describe('as unauthorized user and valid ids', () => {
      it('should return 403, forbidden', done => {
        request.delete(`${url}/api/venue/${this.venue._id}/machine/${this.machine._id}`)
        .set({ Authorization: `Bearer ${this.rando.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
      });
    }); // as unauthorized user an valid ids

    describe('with root auth and valid ids', () => {
      it('should return 202, modified', done => {
        request.delete(`${url}/api/venue/${this.venue._id}/machine/${this.machine._id}`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(202);
          done();
        });
      });
    }); // with root auth and valid ids
  }); // DELETE /api/venue/:id/machine/:machineId
});
