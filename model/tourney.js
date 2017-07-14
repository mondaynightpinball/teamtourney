'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const tourneySchema = Schema({
  created: { type: Date, default: Date.now },
  name: String, // TODO Create semi-random default
  machines: [ String ],
  teams: [{ type: ObjectId, ref: 'team' }],
  rounds: [{ type: ObjectId, ref: 'round' }],
  // venue: { type: ObjectId, ref: 'venue' },
  venue: String,
  owner: { type: ObjectId, ref: 'user' }
});

module.exports = mongoose.model('tourney', tourneySchema);
