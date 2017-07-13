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

  new Tourney(req.body).save()
  .then( tourney => res.status(201).json(tourney))
  .catch(next);
});

function isRoot(req) { return req.user.username === 'root'; }
