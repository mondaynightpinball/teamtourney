'use strict';

require('./lib/test-env.js');

const awsMocks = require('./lib/aws-mocks.js');
const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('mnp:pic-route-test');

const Game = require('../model/game.js');

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const mockUser = require('./lib/mock-user.js');

const url = `http://localhost:${process.env.PORT}`;

describe('Pic Routes', function() {
  before( done => serverToggle.start(server, done));
  after( done => serverToggle.stop(server,done));
  after(require('./lib/clean-db.js'));

  describe('POST /api/game/:gameId/pic', () => {
    describe('with a valid token and data', () => {
      before( done => {
        mockUser()
        .then( user => {
          this.tempUser = user;
          done();
        })
        .catch(done);
      });
      before( done => {
        new Game({
          userId: this.tempUser._id,
          type: 'singles',
          players: [ this.tempUser._id ]
        }).save()
        .then( game => {
          this.tempGame = game;
          done();
        })
        .catch(done);
      });

      it('should return a pic object', done => {
        request.post(`${url}/api/game/${this.tempGame._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempUser.token}`
        })
        .attach('image', `${__dirname}/data/tester.jpeg`)
        .end( (err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.userId).to.equal(this.tempUser._id.toString());
          expect(res.body.gameId).to.equal(this.tempGame._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          expect(res.body.objectKey).to.equal(awsMocks.uploadMock.Key);
          this.tempPic = res.body;
          debug('created ', this.tempPic._id);
          done();
        });
      });
    }); // valid token and data
  }); // POST /api/game/:gameId/pic

  // describe('GET /api/game/:gameId/pic/:picId', () => {
  //   describe('with valid ids', () => {
  //     it('should return a pic', done => {
  //       expect(true).to.equal(false);
  //       done();
  //     });
  //   });
  // }); // GET /api/game/:gameId/pic/:picId
  //
  // describe('GET /api/game/:gameId/pic', () => {
  //   describe('with a valid gameId', () => {
  //     //TODO: list of pics, or most recent?
  //     it('should return a list of pics', done => {
  //       expect(true).to.equal(false);
  //       done();
  //     });
  //   }); // valid id
  // }); // GET /api/game/:gameId/pic

  describe('DELETE /api/game/:gameId/pic/:picId', () => {
    describe('with valid ids', () => {
      it('should return a 204', done => {
        // debug('trying to delete',this.tempPic._id);
        request.delete(`${url}/api/game/${this.tempGame._id}/pic/${this.tempPic._id}`)
        .set({
          Authorization: `Bearer ${this.tempUser.token}`
        })
        .end( (err, res) => {
          expect(res.status).to.equal(204);
          done();
        });
      });
    }); // valid ids
  }); // DELETE /api/game/:gameId/pic/:picId
});
