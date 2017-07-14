'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:tourney-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();

const router = module.exports = new Router();

const Tourney = require('../model/tourney.js');

router.post('/api/tourney', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/tourney', req.body);

  //TODO: Who can make a tourney?
  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  req.body.owner = req.user._id;
  new Tourney(req.body).save()
  .then( tourney => res.status(201).json(tourney))
  .catch(next);
});

router.get('/api/tourney/:id', function(req, res, next) {
  debug('GET /api/tourney/:id',req.params.id);

  Tourney.findById(req.params.id)
  .then( tourney => {
    if(!tourney) return next(createError(404, 'not found'));
    res.json(tourney);
  })
  .catch(next);
});


function isRoot(req) { return req.user.username === 'root' || req.user.admin; }
