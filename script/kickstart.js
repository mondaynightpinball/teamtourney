'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
require('dotenv').load();

const debug = console.log;

const Tourney = require('../model/tourney');
const Team = require('../model/team');

const start = module.exports = function() {
  return new Promise( (resolve, reject) => {
    //STEP 1: Create a tourney
    const machines = fs.readdirSync('./data/machines').map(fn => {
      return fs.readFileSync('./data/machines/' + fn).toString();
    });
    new Tourney({
      name: 'MNP Team Tourney',
      venue: 'Ozzie\'s',
      machines: machines
    }).save().then( tourney => {
      //STEP 2: Load up all the teams.
      const teams = fs.readdirSync('./data/teams').map(fn => {
        debug('Loading Team:', fn);
        const team = { roster: [], tourneyId: tourney._id };
        const raw = fs.readFileSync('./data/teams/' + fn).toString();
        raw.split('\n').forEach( (line, i) => {
          debug(i, line);
          if(i === 0) team.name = line;
          else if(line.length > 0) team.roster.push(line);
        });
        return team;
      });
      debug('Parsed teams:\n', teams);

      let pos = 0;
      function _work() {
        if(pos >= teams.length) return resolve(tourney);
        debug('Saving:', teams[pos]);
        new Team(teams[pos]).save().then( team => {
          debug('Saved: ', team.name);
          pos++;
          _work();
        });
      }
      _work();
    }).catch(reject);
  });
};

let tourneyId;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
.then( () => {
  return start();
})
.then( tourney => {
  tourneyId = tourney._id;
  return tourney.createSchedule();
})
.then( () => {
  return Tourney.load(tourneyId);
})
.then( t => {
  console.log('------------- TOURNEY ----------------');
  console.log(JSON.stringify(t, null, 2));
})
.catch( err => debug(err.message));
