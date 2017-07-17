'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const Team = require('./team.js');
const Round = require('./round.js');
const Match = require('./match.js');
const Game = require('./game.js');

const makeSchedule = require('../lib/scheduler.js');

const tourneySchema = Schema({
  created: { type: Date, default: Date.now },
  name: String, // TODO Create semi-random default
  machines: [ String ],
  // teams: [{ type: ObjectId, ref: 'team' }], // Teams have a tourneyId
  // rounds: [{ type: ObjectId, ref: 'round' }], // Rounds have a tourneyId
  roundNum: Number,
  // venue: { type: ObjectId, ref: 'venue' },
  venue: String,
  owner: { type: ObjectId, ref: 'user' }
});

tourneySchema.methods.createSchedule = function() {
  return new Promise( (resolve, reject) => {
    //Collect all the teams.
    Team.find({ tourneyId: this._id })
    .then( teams => {
      console.log('found:', teams.length);

      const schedule = makeSchedule(
        teams.map(team => team._id),
        this.machines,
        3
      );

      console.log('schedule:\n', schedule);
      Promise.all([
        new Round({ num: 1, tourneyId: this._id }).save(),
        new Round({ num: 2, tourneyId: this._id }).save(),
        new Round({ num: 3, tourneyId: this._id }).save()
      ])
      .then( rounds => {
        console.log('Saved rounds:', rounds);

        return Promise.all(schedule.map( (round, i) => {
          Promise.all(round.map( match => {
            return new Match({
              roundId: rounds[i]._id,
              away: match.away,
              home: match.home
            }).save().then( m => {
              return Promise.all(match.machines.map( machine => {
                return new Game({
                  type: 'doubles',
                  matchId: m._id,
                  machine: machine
                }).save();
              }));
            });
          }));

        }));
      })
      .then( () => {
        console.log('ALL DONE SAVING SCHEDULE');
        resolve();
      });
    })
    .catch(reject);
  });
};

tourneySchema.statics.load = function(id) {
  return new Promise( (resolve, reject) => {
    this.findById(id)
    .then( tourney => {
      if(!tourney) return reject(new Error('not found'));
      // Fill out rounds -> matches -> games
      const res = {
        _id: tourney._id,
        created: tourney.created,
        roundNum: tourney.roundNum || 0,
        rounds: []
      };
      const map = {};
      Team.find({ tourneyId: tourney._id })
      .then( teams => {
        teams.forEach( team => {
          map[team._id] = team.name;
        });

        Round.find({ tourneyId: tourney._id })
        .then( rounds => {
          return Promise.all( rounds.map( round => {
            const r = {
              num: round.num,
              matches: []
            };
            res.rounds.push(r);
            return Match.find({ roundId: round._id })
            .then( matches => {
              return Promise.all( matches.map( match => {
                const m = {
                  roundId: round._id,
                  away: { _id: match.away, name: map[match.away] },
                  home: { _id: match.home, name: map[match.home] },
                  games: []
                };
                r.matches.push(m);
                return Game.find({ matchId: match._id })
                .then( games => {
                  games.forEach( game => {
                    m.games.push(game);
                  });
                });
              }));
            });
          }));
        })
        .then( () => resolve(res));

      });


    });
  });
};

module.exports = mongoose.model('tourney', tourneySchema);
