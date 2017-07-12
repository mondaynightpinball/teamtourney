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
  teams: [{ type: ObjectId, ref: 'team' }],
  rounds: [{ type: ObjectId, ref: 'round' }],
  venue: { type: ObjectId, ref: 'venue' }
});

module.exports = mongoose.model('tourney', tourneySchema);
