'use strict';

const jsonParser = require('body-parser').json();
const debug = require('debug')('mnp:auth-route');
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware');
const createError = require('http-errors');

const User = require('../model/user.js');

const router = module.exports = new Router();

router.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST /api/signup');

  // NOTE: While it is nice to let mongoose do our validation, there
  //       were some problems getting it to do what I expected it to.
  // TODO: Maybe revisit having mongoose validate req.body on save().
  if(!req.body ||
    !req.body.username ||
    !req.body.email ||
    !req.body.password) {
    return next(createError(400, 'bad request'));
  }

  //Extra security step to prevent any from ever signing up as root.
  //Though the root account should exist and thus prevent any signups as root.
  if(req.body.username === 'root') return next(createError(403, 'Forbidden'));

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);
  user.generatePasswordHash(password)
  // .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

//NOTE: Basic Auth is pretty weak, but since we run on https,
//      it's not too terrible.
router.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET /api/signin');

  User.findOne({ username: req.auth.username })
  // .then( user => user.comparePasswordHash(req.auth.password))
  .then( user => {
    if(!user) throw new Error('Access denied');
    return user.comparePasswordHash(req.auth.password);
  })
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch( err => next(createError(401, err.message)));
});
