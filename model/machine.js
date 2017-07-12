'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;

//TODO Q: How to enforce that name + variation is unique?
const machineSchema = Schema({
  name: { type: String, required: true }, //Non-Unique, allows for variations.
  variation: String // For things like LE, Pro, etc
  // code: { type: String, required: true, unique: true } // Removing from model, at least for TT
});

module.exports = mongoose.model('machine', machineSchema);
