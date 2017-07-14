'use strict';

const AWS = require('aws-sdk-mock');
const debug = require('debug')('mnp:aws-mocks');

const bucket = 'gws-cfgram';

module.exports = exports = {};

exports.uploadMock = {
  ETag: '"1234abcd"',
  Location: 'http://mockurl.com/mock.png',
  Key: 'mock.png',
  key: 'mock.png',
  Bucket: 'gws-cfgram'
};

AWS.mock('S3', 'upload', function(params, callback) {
  debug('upload()');

  if(params.ACL !== 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }
  if(params.Bucket !== bucket) {
    return callback(new Error(`Bucket must be ${bucket}`));
  }
  if(!params.Key) {
    return callback(new Error('Key required'));
  }
  if(!params.Body) {
    return callback(new Error('Body required'));
  }

  return callback(null, exports.uploadMock);
});

AWS.mock('S3', 'deleteObject', function(params, callback) {
  debug('deleteObject()');

  if(params.Bucket !== bucket) {
    return callback(new Error(`Bucket must be ${bucket}`));
  }
  if(!params.Key) {
    return callback(new Error('Key required'));
  }

  return callback(null, {});
});






//
