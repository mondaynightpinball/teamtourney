'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:team-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();

const router = module.exports = new Router();

const Team = require('../model/team.js');

router.post('/api/team', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/team');

  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  new Team(req.body).save()
  .then( team => {
    res.status(201).json(team);
  })
  .catch( err => next(createError(400, err.message)));
});

router.get('/api/team/:id', function(req, res, next) {
  debug('GET /api/team/:id');

  Team.findById(req.params.id)
  .then( team => {
    if(!team) return next(createError(404, 'not found'));
    res.json(team);
  })
  .catch(next);
});

router.put('/api/team/:id/player', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/team/:id/player');

  //TODO: isRoot -> isAuth
  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  Team.findById(req.params.id)
  .then( team => {
    return team.addPlayer(req.body);
  })
  .then( team => res.status(202).json(team))
  .catch(next);
});

function isRoot(req) { return req.user.username === 'root'; }
