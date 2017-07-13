'use strict';

// const debug = require('debug')('mnp:mock-venue');
const Promise = require('bluebird');

const Venue = require('../../model/venue.js');
const Machine = require('../../model/machine.js');

const machines = [
  'Eight Ball Deluxe',
  'Attack From Mars',
  'Twilight Zone',
  'Stars',
  'Dialed In'
];

module.exports = function() {
  return Promise.all(machines.map( m => {
    return new Machine({ name: m }).save();
  })).then( items => {
    return new Venue({
      name: 'Example Venue',
      code: 'VEN',
      machines: items
    }).save();
  });

  // return new Promise( (resolve, reject) => {
  //   //We need a few machines for our venue.
  // });

};
