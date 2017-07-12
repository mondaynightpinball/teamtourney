'use strict';

const createError = require('http-errors');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const debug = require('debug')('mnp:game');

const gameSchema = Schema({
  // userId: { type: ObjectId, required: true }, // All games are created by root for now.
  created: { type: Date, default: Date.now },
  // I'm ok leaving the game.type field in the model, but the plan is only to have doubles.
  type: {
    type: String,
    required: true,
    enum: ['singles', 'doubles', 'shared']
  },
  tourneyId: { type: ObjectId, required: true },
  round: { type: ObjectId, required: true },
  machine: { type: ObjectId, ref: 'machine' },
  //TODO: Bring back venue?
  // venue: { type: Schema.Types.ObjectId, ref: 'venue', required: true },
  players: [{ type: ObjectId }], // Size based on type
  scores: [{ type: Number }],
  points: [{ type: Number }]
});

//TODO: Who is allowed to call this? Add a reportedBy param?
gameSchema.methods.reportScores = function(playerId, scores) {
  debug('reportScores');

  if(!scores) return Promise.reject(createError(400, 'scores required'));

  if(this.type === 'singles' && this.players.length !== 2) {
    return Promise.reject(createError(400, 'incorrect number of players before reporting'));
  }

  if(this.type === 'doubles' && this.players.length !== 4) {
    return Promise.reject(createError(400, 'incorrect number of players before reporting'));
  }

  if(!Array.isArray(scores)) {
    return Promise.reject(createError(400, 'scores should be an array'));
  }

  //TODO: Verify that scores is an array of number, or let save() validate it?

  if(scores.length !== this.players.length) {
    return Promise.reject(createError(400, 'incorrect number of scores'));
  }

  //TODO: Only overwrite non-zero values from scores?
  this.scores = scores;

  //TODO: Shouldn't we return save();
  return Promise.resolve(this);
};

gameSchema.methods.join = function(playerId) {
  debug('join');

  //TODO: Allow for 2, 3, or 4 player games.
  if(this.players.length > 1) {
    return Promise.reject(createError(400, 'game full'));
  }

  this.players.push(playerId);
  return Promise.resolve(this);
};

module.exports = mongoose.model('game', gameSchema);
