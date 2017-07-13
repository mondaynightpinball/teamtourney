'use strict';

const debug = require('debug')('mnp:team-route-test');
const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleTeam = {
  name: 'Example Team',
  code: 'exm'
};

function mockUsers(fieldnames) {
  debug('mockUsers:',fieldnames);
  let list = fieldnames;
  let users = this;

  return new Promise( (resolve, reject) => {
    function _make() {
      if(list.length === 0) return resolve(); //TODO: resolve what?
      let fn = list.pop();
      require('./lib/mock-user.js')()
      .then( user => {
        debug(fn,user);
        users[fn] = user;
        _make();
      })
      .catch(reject);
    }
    _make();
  });
}

describe('Team Routes', function() {
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
    mockUsers.call(this, ['captain','cocap','player','rando'] )
    .then(done).catch(done);
  });
  after(require('./lib/clean-db.js'));
  // TODO: Should we stop the server? It kind of sucks to restart for every test file.
  // after( done => serverToggle.stop(server, done));

  describe('POST /api/team', () => {
    describe('as unauthorized user and valid body', () => {
      it('should return 403, forbidden', done => {
        request.post(`${url}/api/team`)
        .set({ Authorization: `Bearer ${this.rando.token}`})
        .send(exampleTeam)
        .end( (err, res) => {
          expect(res.status).to.equal(403);
          done();
        });
      });
    }); // root auth and valid body

    describe('with root auth and valid body', () => {
      it('should create a team and return 201', done => {
        request.post(`${url}/api/team`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send(exampleTeam)
        .end( (err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body.name).to.equal(exampleTeam.name);
          expect(res.body.code).to.equal(exampleTeam.code);
          this.team = res.body;
          done();
        });
      });
    }); // root auth and valid body
  }); // POST /api/team

  describe('GET /api/team/:id', () => {
    describe('with a valid id', () => {
      it('should return a team', done => {
        request.get(`${url}/api/team/${this.team._id}`)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(this.team);
          done();
        });
      });
    }); //valid id
  }); // GET /api/team/:id

  describe('PUT /api/team/:id/player', () => {
    describe('with valid auth and valid captain', () => {
      it('should add a captain to the team', done => {
        request.put(`${url}/api/team/${this.team._id}/player`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send({ playerId: this.captain._id, role: 'captain' })
        .end( (err, res) => {
          debug(res.body);
          expect(res.status).to.equal(202);
          expect(res.body.roster.length).to.equal(1);
          expect(res.body.roster[0]).to.equal(this.captain._id.toString());
          done();
        });
      }); // root + captain
    }); // valid request

    //TODO: Test who is allowed to add players.
    //      MNP standard is league admin for roster,
    //      captain or higher for matches.

    describe('with valid auth and valid co-captain', () => {
      it('should add a co-captain to the team', done => {
        request.put(`${url}/api/team/${this.team._id}/player`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send({ playerId: this.cocap._id, role: 'co-captain' })
        .end( (err, res) => {
          debug(res.body);
          expect(res.status).to.equal(202);
          expect(res.body.roster.length).to.equal(2); //TODO: Beware counting each one.
          expect(res.body.roster[1]).to.equal(this.cocap._id.toString());
          done();
        });
      }); // root + co-captain
    }); // valid request

    describe('with valid auth and valid player', () => {
      it('should add a player to the team', done => {
        request.put(`${url}/api/team/${this.team._id}/player`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send({ playerId: this.player._id, role: 'player' })
        .end( (err, res) => {
          debug(res.body);
          expect(res.status).to.equal(202);
          expect(res.body.roster.length).to.equal(3); //TODO: Beware counting each one.
          expect(res.body.roster[2]).to.equal(this.player._id.toString());
          done();
        });
      }); // root + player
    }); // valid request

    //TODO: Improve the response for add of existing player.
    describe('with valid auth and existing player', () => {
      it('should NOT add player to the team', done => {
        request.put(`${url}/api/team/${this.team._id}/player`)
        .set({ Authorization: `Bearer ${this.root.token}`})
        .send({ playerId: this.player._id, role: 'player' })
        .end( (err, res) => {
          debug('BODY:',res.body);
          debug('TEXT:',res.text);
          debug('MSG:',res.statusMessage);
          expect(res.status).to.equal(500);
          //TODO: Confirm that team object is the same.
          //      Since the error doesn't currently return
          //      the team on a redundant call, we have to think about things.
          done();
        });
      }); // root + player
    }); // valid request

    describe('with rando auth', () => {
      it('should return a 403', done => {
        request.put(`${url}/api/team/${this.team._id}/player`)
        .set({ Authorization: `Bearer ${this.rando.token}`})
        .send({ playerId: this.rando._id, role: 'player' })
        .end( (err, res) => {
          debug(res.body);
          expect(res.status).to.equal(403);
          done();
        });
      }); // rando + rando
    }); // invalid request

  }); // PUT /api/team/:id/player
});
