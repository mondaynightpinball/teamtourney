'use strict';

const express = require('express');
const debug = require('debug')('mnp:server');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

require('dotenv').load();
const PORT = process.env.PORT || 8000;

const app = express();

app.use(require('cors')());
app.use(require('morgan')('dev'));


// TODO: Allow for descendents.
require('fs').readdirSync('./route').forEach( route => {
  debug('USE:',route);
  app.use(require(`./route/${route}`));
});

let server = null;

module.exports = {
  start: () => {
    if(server) return Promise.resolve();
    debug('MONGODB_URI:', process.env.MONGODB_URI);
    return new Promise( (resolve, reject) => {
      mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
      .then( () => {
        debug('MONGO Connected');
        return app.listen(PORT);
      })
      .then( _server => {
        debug('Server Up');
        server = _server;
        return resolve();
      })
      .catch( err => {
        debug(err);
        reject(err);
      });
    });
  },
  stop: () => {
    if(!server) return Promise.resolve();
    debug('STOPPING...');
    return new Promise( (resolve, reject) => {
      server.close( err => {
        if(err) return reject(err);
        debug('Server down, closing mongoose');
        mongoose.connection.close()
        .then( () => {
          debug('MONGO closed');
          server = null;
          return resolve();
        }).catch(reject);
      });
    });
  },
  PORT: PORT
};
