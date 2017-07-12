'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const playerSchema = Schema({
  name: { type: String, required: true },
  userId: { type: ObjectId }, // Optional Link
  teamId: { type: ObjectId }
});

module.exports = mongoose.model('player', playerSchema);
