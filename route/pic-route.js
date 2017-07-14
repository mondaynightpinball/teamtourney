'use strict';

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const createError = require('http-errors');
const Router = require('express').Router;
const Promise = require('bluebird');
const debug = require('debug')('mnp:pic-route.js');

const Pic = require('../model/pic.js');
const Game = require('../model/game.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(Promise);

//NOTE: Loading s3 here did not allow for the mocks to work.
// const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const router = module.exports = new Router();

function s3uploadProm(params) {
  let s3 = new AWS.S3(); //Moving s3 here allows the mocks to work.
  debug('s3uploadProm', params.Key);
  return new Promise( (resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if(err) return reject(err);
      resolve(s3data);
    });
  });
}

function s3deleteProm(params) {
  let s3 = new AWS.S3();
  debug('s3deleteProm', params);
  return new Promise( (resolve, reject) => {
    s3.deleteObject(params, (err, s3data) => {
      if(err) return reject(err);
      // TODO: check s3data for success.
      debug('deleteObject s3data', s3data);
      resolve(s3data);
    });
  });
}

router.post('/api/game/:gameId/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST /api/game/:gameId/pic');

  if(!req.file) return next(createError(400, 'file not found'));
  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Game.findById(req.params.gameId)
  .catch( err => next(createError(404, err.message)))
  .then( () => s3uploadProm(params))
  .then( s3data => {
    debug('s3data', s3data);
    // Lecture was deleting everything, but that could
    // cause problems with multiple users.
    del(req.file.path);
    return new Pic({
      userId: req.user._id,
      gameId: req.params.gameId,
      imageURI: s3data.Location,
      objectKey: s3data.Key
    }).save();
  })
  .then( pic => res.json(pic))
  .catch(next);
});

// router.get('/api/game/:gameId/pic', bearerAuth, function(req, res, next) {
//   debug('GET /api/game/:gameId/pic');
//
//   Pic.findById(req.params.picId)
//   .then( pic => res.json(pic))
//   .catch( err => next(createError(404, err.message)));
// });

//Q: Why not just /api/pic/:id ?
router.delete('/api/game/:gameId/pic/:picId', bearerAuth, function(req, res, next) {
  debug('DELETE /api/game/:gameId/pic/:picId');

  Pic.findById(req.params.picId)
  .catch( err => next(createError(404, err.message)))
  .then( pic => {
    if(pic.userId.toString() !== req.user._id.toString()) {
      debug('not the owner of the pic');
      return next(createError(401, 'not the owner of the pic'));
    }

    return s3deleteProm({
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey
    });
  })
  .then( () => Pic.findByIdAndRemove(req.params.picId))
  .then( () => res.status(204).send('OK'))
  .catch(next);
});
