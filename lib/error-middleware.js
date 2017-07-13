'use strict';

const createError = require('http-errors');
const debug = require('debug')('mnp:error-middleware');

module.exports = function(err, req, res, next) {
  debug('----------------------------------------------');
  debug('ERR:', err.message || err);

  if(err.status) {
    debug('user error:', err.status, err.name);
    res.status(err.status).send(err.name);
    return next();
  }

  if(err.name == 'ValidationError') {
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    return next();
  }

  debug('server error:',err.name);
  err = createError(500, err.message || err);
  res.status(err.status).send(err.name || err);
  next();
};
