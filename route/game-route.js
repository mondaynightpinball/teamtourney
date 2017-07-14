'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:game-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();

//TODO: Do we need User?
const Game = require('../model/game.js');

const router = module.exports = new Router();

//TODO: router.use(bearerAuth) ???

router.post('/api/game', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/game');

  req.body.userId = req.user._id;
  // req.body.players = [req.user._id]; //If you create a game, you are in it...for now.
  new Game(req.body).save()
  .then( game => res.json(game))
  .catch(next);
});

router.get('/api/game/:id', bearerAuth, function(req, res, next) {
  debug('GET /api/game/:id', req.params.id); //Q: Is it bad to print id?

  Game.findById(req.params.id)
  .then( game => res.json(game))
  .catch( () => next(createError(404, 'not found')));
});

// JOIN a game
router.put('/api/game/:id/join', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/game/:id/join');

  Game.findById(req.params.id)
  .catch( () => next(createError(404, 'not found')))
  .then( game => {
    if(!game) return next(createError(404, 'not found'));
    return game.join(req.user._id);
  })
  // .then( game => game.join(req.user._id))
  .then( game => game.save())
  .then( game => res.json(game))
  .catch(next); //TODO: createError?
});

// Report scores for a game
router.put('/api/game/:id/report-scores', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/game/:id/report-scores');

  Game.findById(req.params.id)
  .catch( () => next(createError(404, 'not found')))
  .then( game => game.reportScores(req.user._id, req.body))
  .then( game => game.save())
  .then( game => res.json(game))
  .catch( err => next(createError(400, err.message)));
});
