'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:machine-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();
const Machine = require('../model/machine.js');

const router = module.exports = new Router();

router.post('/api/machine', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/machine');

  if(req.user.username !== 'root') {
    return next(createError(403, 'forbidden'));
  }

  new Machine(req.body).save()
  .then( machine => res.status(201).json(machine))
  .catch(next);
});

router.get('/api/machine/:id', function(req, res, next) {
  debug('GET /api/machine/:id');

  Machine.findById(req.params.id)
  .then( machine => {
    if(!machine) return next(createError(404, 'not found'));
    res.json(machine);
  })
  .catch( () => next(createError(404, 'not found or bad id')));
});

router.delete('/api/machine/:id', bearerAuth, function(req, res, next) {
  debug('DELETE /api/machine/:id');

  Machine.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch(next);
});
