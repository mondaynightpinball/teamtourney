'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const matchSchema = Schema({
  roundId: { type: ObjectId, required: true },
  away: { type: ObjectId, ref: 'team' },
  home: { type: ObjectId, ref: 'team' },
});

module.exports = mongoose.model('match', matchSchema);
