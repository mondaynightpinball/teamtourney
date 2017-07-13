'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:venue-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();

const router = module.exports = new Router();

const Venue = require('../model/venue.js');

router.post('/api/venue', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/league/:id/venue');

  //If a league admin needs to be able to add a venue,
  //perhaps adding venues is something that should
  //be bound to a league operation.

  //TODO: Who can make a venue?
  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  //TODO: Is there anything we need to add to req.body?

  new Venue(req.body).save()
  .then( venue => res.status(201).json(venue))
  .catch(next);
});

router.get('/api/venue/:id', function(req, res, next) {
  debug('GET /api/venue/:id',req.params.id);

  Venue.findById(req.params.id)
  .then( venue => {
    if(!venue) return next(createError(404, 'not found'));
    res.json(venue);
  })
  .catch(next);
});

//TODO: router.put()

router.delete('/api/venue/:id', bearerAuth, function(req, res, next) {
  debug('DELETE /api/venue/:id');

  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  Venue.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch(next); // TODO: 404 ?
});

router.put('/api/venue/:id/machine', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/venue/:id/machine');

  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  Venue.findById(req.params.id)
  .then( venue => {
    if(!venue) return next(createError(404, 'not found'));
    if(venue.machines.indexOf(req.body.machineId) !== -1) {
      return res.status(202).json(venue);
    }
    venue.machines.push(req.body.machineId);
    return venue.save();
  })
  .then( venue => res.status(202).json(venue))
  .catch(next);
});

router.delete('/api/venue/:id/machine/:machineId', bearerAuth, function(req, res, next) {
  debug('DELETE /api/venue/:id/machine/:machineId');

  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  Venue.findById(req.params.id)
  .then( venue => {
    if(!venue) return next(createError(404, 'venue not found'));
    let index = venue.machines.indexOf(req.params.machineId);
    if(index !== -1) {
      venue.machines.splice(index, 1);
      return venue.save();
    }
    return next(createError(400, 'venue does not have that machine'));
  })
  .then( () => res.status(202).send('removed machine from venue'))
  .catch(next);
});

function isRoot(req) { return req.user.username === 'root'; }
