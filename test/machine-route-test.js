'use strict';

// const debug = require('debug')('mnp:machine-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const server = require('../server.js');
const Machine = require('../model/machine.js');

const url = `http://localhost:${process.env.PORT}`;

describe('Machine Routes', function() {
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

  describe('POST /api/machine', () => {
    describe('as root user and valid body', () => {
      it('should return 201 and a machine', done => {
        request.post(`${url}/api/machine`)
        .set({ Authorization: `Bearer ${this.root.token}` })
        .send({
          name: 'Eight Ball Deluxe',
          code: 'EBD'
        })
        .end( (err, res) => {
          expect(res.status).to.equal(201);
          // expect(res.body.code).to.equal('EBD');
          expect(res.body.name).to.equal('Eight Ball Deluxe');
          this.machine = res.body;
          done();
        });
      });
    }); // root and valid

    describe('as unauthorized and valid body', () => {
      it('should return 403', done => {
        request.post(`${url}/api/machine`)
        .set({ Authorization: `Bearer ${this.rando.token}` })
        .send({
          name: 'Attack From Mars',
          code: 'AFM'
        })
        .end( (err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
      });
    }); // unauthorized and valid
  }); // POST /api/machine

  describe('DELETE /api/machine/:id', () => {
    describe('as root user', () => {
      it('should remove the machine and return 204', done => {
        request.delete(`${url}/api/machine/${this.machine._id}`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .end( (err, res) => {
          expect(res.status).to.equal(204);
          Machine.findById(this.machine._id)
          .then( machine => {
            expect(machine).to.equal(null);
            done();
          });
        });
      });
    }); // as root user
  }); // DELETE /api/machine/:id
});
