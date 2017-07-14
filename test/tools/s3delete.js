'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');
AWS.config.setPromisesDependency(Promise);

//NOTE: The tools library needs its own .env file
//      unless there is a way to load something
//      different than the default.
//REQUIRED ENV: AWS_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
require('dotenv').load();

const s3 = new AWS.S3();

const bucket = process.env.AWS_BUCKET;
console.log('bucket:', bucket);

const objectKey = process.argv[2];
if(!objectKey) return console.error('objectKey required');

let params = {
  Bucket: bucket,
  Key: objectKey
};

s3.deleteObject(params, (err, data) => {
  if(err) return console.error(err.message);
  console.log(data);
});
