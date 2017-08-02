'use strict';

const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('mnp:tourney-route');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const jsonParser = require('body-parser').json();

const router = module.exports = new Router();

const Tourney = require('../model/tourney.js');

router.post('/api/tourney', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST /api/tourney', req.body);

  //TODO: Who can make a tourney?
  if(!isRoot(req)) return next(createError(403, 'forbidden'));

  req.body.owner = req.user._id;
  new Tourney(req.body).save()
  .then( tourney => res.status(201).json(tourney))
  .catch(next);
});

router.get('/api/tourney', function(req, res, next) {
  debug('GET /api/tourney');

  Tourney.find({}).sort('-created')
  .then( list => {
    //TODO: NOTE for now I'm just returning the most current.
    return Tourney.load(list[0]._id);
  })
  .then( tourney => {
    res.json(tourney);
  })
  .catch(next);
});

router.get('/api/tourney/:id', function(req, res, next) {
  debug('GET /api/tourney/:id',req.params.id);

  // Tourney.findById(req.params.id)
  Tourney.load(req.params.id)
  .then( tourney => {
    if(!tourney) return next(createError(404, 'not found'));
    res.json(tourney);
  })
  .catch(next);
});

router.get('/api/tourney/:id/matches', function(req, res, next) {
  debug('GET /api/tourney/:id/matches');

  Tourney.load(req.params.id)
  .then( tourney => {
    if(tourney.roundNum === 0) {
      return res.json([]);
    }
    const round = tourney.rounds.find( x => x.num === tourney.roundNum);
    res.json(round.matches);
  })
  .catch(next);
});

router.put('/api/tourney/:id/next-round', function(req, res, next) {
  debug('PUT /api/tourney/:id/next-round');

  Tourney.findById(req.params.id)
  .then( tourney => {
    //TODO Only allow the roundNum to advance if all games are done.
    console.log('Current Round:', tourney.roundNum);
    tourney.roundNum++;
    return tourney.save();
  })
  .then( () => res.send('OK'))
  .catch(next);
});

router.get('/api/tourney/:id/standings', function(req, res, next) {
  debug('GET /api/tourney/:id/standings');

  Tourney.load(req.params.id)
  .then( tourney => {
    const names = {};
    const points = {};
    tourney.rounds.forEach( round => {
      round.matches.forEach( match => {
        const awayId = match.away._id;
        const homeId = match.home._id;
        names[homeId] = match.home.name;
        names[awayId] = match.away.name;
        if(!points[homeId]) points[homeId] = 0;
        if(!points[awayId]) points[awayId] = 0;
        match.games.forEach( game => {
          console.log(game);
          if(game.points.length === 4) {
            points[awayId] += game.points[0] + game.points[2];
            points[homeId] += game.points[1] + game.points[3];
          }
        });
      });
    });

    console.log('POINTS:', points);

    const standings = [];
    Object.keys(names).forEach( id => {
      standings.push({
        teamId: id,
        name: names[id],
        points: points[id]
      });
    });
    standings.sort( (a,b) => {
      if(a.points < b.points) return 1;
      if(a.points > b.points) return -1;
      return 0;
    });
    res.json(standings);
  })
  .catch(next);
});

// TODO: It might be better to have an isRoot middleware, and attach something like req.root = true
function isRoot(req) { return req.user.username === 'root' || req.user.admin; }
