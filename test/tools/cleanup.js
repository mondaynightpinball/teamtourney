'use strict';

const cleanDb = require('../lib/clean-db.js');

const server = require('../../server.js');

server.start().then( () => cleanDb())
.then( () => {
  console.log('success');
})
.catch( err => console.error(err))
.finally( () => server.stop().then( () => {
  console.log('server stopped');
}));
