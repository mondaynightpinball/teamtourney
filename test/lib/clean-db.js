'use strict';

const debug = require('debug')('mnp:clean-db');
const User = require('../../model/user.js');
const Tourney = require('../../model/tourney.js');
const Team = require('../../model/team.js');
const Round = require('../../model/round.js');
const Match = require('../../model/match.js');
const Game = require('../../model/game.js');

const Venue = require('../../model/venue.js');
const Pic = require('../../model/pic.js');
const Machine = require('../../model/machine.js');

const Promise = require('bluebird');

// const del = require('del');
const dataDir = `${__dirname}/../../data`;

//NOTE: We are not connecting to mongoose here
//      because it's assumed that the server will
//      be running.

module.exports = function() {
  debug('working...');
  debug('dataDir',dataDir);

  return Promise.all([
    User.remove({}),
    Venue.remove({}),
    Team.remove({}),
    Tourney.remove({}),
    Game.remove({}),
    Pic.remove({}),
    Machine.remove({}),
    Round.remove({}),
    Match.remove({}),
    // Promise.resolve(del(`${dataDir}/*`))
  ]);
};
