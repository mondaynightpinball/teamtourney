'use strict';

// const createError = require('http-errors');
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
// const debug = require('debug')('mnp:game');

const tourneySchema = Schema({
  created: { type: Date, default: Date.now },
  name: { type: String }, // TODO Create semi-random default
  teams: [{ type: ObjectId, ref: 'team' }],
  rounds: [{ type: ObjectId, ref: 'round' }],
  venue: { type: ObjectId, ref: 'venue' },
  owner: { type: ObjectId, ref: 'user' }
});

module.exports = mongoose.model('tourney', tourneySchema);
