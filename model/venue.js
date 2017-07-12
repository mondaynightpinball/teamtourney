'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const venueSchema = Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  machines: [{ type: ObjectId, ref: 'machine' }],
  address: { type: String },
  neighborhood: { type: String }
});

module.exports = mongoose.model('venue', venueSchema);
