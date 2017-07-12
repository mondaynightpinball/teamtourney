'use strict';

const createError = require('http-errors');
const debug = require('debug')('mnp:basic-auth-middleware');

module.exports = function(req, res, next) {
  debug();

  var authHeader = req.headers.authorization;
  if(!authHeader) return next(createError(401, 'missing authorization header'));

  var base64str = authHeader.split('Basic ')[1];
  if(!base64str) return next(createError(401, 'username and password required'));

  var utf8str = new Buffer(base64str, 'base64').toString();
  var authPair = utf8str.split(':');

  req.auth = {
    username: authPair[0],
    password: authPair[1]
  };

  if(!req.auth.username || !req.auth.password) {
    return next(createError(401, 'username and password are required'));
  }

  return next();
};
