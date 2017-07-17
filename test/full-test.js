'use strict';

const expect = require('chai').expect;
const request = require('superagent');

const server = require('../server.js');
const Tourney = require('../model/tourney.js');
const User = require('../model/user.js');

const url = `http://localhost:${server.PORT}`;

describe('Full Test', function() {
  before( done => {
    server.start().then( () => done());
  });
  before( done => {
    Tourney.find({}).sort('-created')
    .then( list => {
      // console.log(list.length);
      this.tourneyId = list[0]._id;
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
  after( done => {
    User.remove({}).then( () => done());
  });

  describe('Get the tourney', () => {
    it('should get the json', done => {
      request.get(`${url}/api/tourney/${this.tourneyId}`)
      .then( res => {
        console.log('Found', res.body);
        expect(res.body._id).to.equal(`${this.tourneyId}`);
        this.tourney = res.body;
        done();
      });
    });
  });

  describe('Submit a score', () => {
    it('should update the score and points', done => {
      //Which game to report?
      const game = this.tourney.rounds[0].matches[0].games[0];
      request.put(`${url}/api/game/${game._id}`)
      .set({ Authorization: `Bearer ${this.root.token}` })
      .send({
        players: [ 'A', 'B', 'C', 'D' ],
        scores: [ 100, 200, 300, 400 ]
      })
      .then( res => {
        console.log(res.body);
        expect(res.body.points).to.deep.equal([ 0, 1.5, 1, 2.5]);
        done();
      });
    });
  });

  describe('Get the standings', () => {
    it('should return a sorted array', done => {
      request.get(`${url}/api/tourney/${this.tourneyId}/standings`)
      .then( res => {
        console.log(res.body);
        done();
      });
    });
  });
});
