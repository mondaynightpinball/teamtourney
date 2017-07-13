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

let running = false;

module.exports = {
  // TODO: Dang, maybe the promise version is not as nice.
  // start: (done) => {
  start: () => {
    if(running) return Promise.resolve();
    debug('MONGODB_URI:', process.env.MONGODB_URI);
    return new Promise( (resolve, reject) => {
      mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
      .then( () => {
        debug('MONGO Connected');
        // app.listen(PORT, () => debug('Server Up'));
        return app.listen(PORT);
      })
      .then( () => {
        debug('Server Up');
        running = true;
        return resolve();
      })
      .catch( err => {
        debug(err);
        reject(err);
      });
    });
  },
  stop: () => {
    if(!running) return Promise.resolve();
    debug('STOPPING...');
    return new Promise( (resolve, reject) => {
      app.close( err => {
        if(err) return reject(err);
        debug('Server down, closing mongoose');
        mongoose.connection.close()
        .then( () => {
          debug('MONGO closed');
          running = false;
          return resolve();
        }).catch(reject);
      });
    });
  },
  PORT: PORT
};
