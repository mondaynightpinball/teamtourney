'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const roundSchema = Schema({
  tourneyId: { type: ObjectId, required: true },
  num: Number // What round number is it? 1, 2, 3, 4 (semis), 5 (finals)
});

module.exports = mongoose.model('round', roundSchema);
