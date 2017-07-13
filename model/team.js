'use strict';

const debug = require('debug')('mnp:team');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const teamSchema = Schema({
  name: { type: String, required: true },
  //NOTE: We might only need team codes to be unique
  //      in the context of a given league.
  code: { type: String, required: true, unique: true },
  venueId: { type: ObjectId, ref: 'venue' },
  captain: { type: ObjectId },
  // coCaptain: { type: ObjectId }, // Team tourney only needs 1 captain.
  roster: [{ type: ObjectId }]
});

teamSchema.methods.addPlayer = function(player) {
  debug('player:',player);
  if(player.role === 'captain') this.captain = player.playerId;
  // if(player.role === 'co-captain') this.coCaptain = player.playerId;

  if(this.roster.indexOf(player.playerId) !== -1) {
    return Promise.reject('Already have player on team');
  }

  this.roster.push(player.playerId);
  return this.save();
};

module.exports = mongoose.model('team', teamSchema);
