'use strict';

const createError = require('http-errors');
const debug = require('debug')('mnp:bearer-auth-middleware');

const User = require('../model/user.js');

module.exports = function(req, res, next) {
  debug('working...');

  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'authorization header required'));

  var token = authHeader.split('Bearer ')[1];
  if(!token) return next(createError(401, 'token required'));

  req.token = token;

  User.findByToken(token)
  .then( user => {
    req.user = user;
    next();
  })
  .catch(next);
};
