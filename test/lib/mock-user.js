'use strict';

const User = require('../../model/user.js');
const debug = require('debug')('mnp:mock-user');

var num = 0;

module.exports = function() {
  debug('working...', Date.now());
  num++;
  let _user = {};
  let rando = Math.floor(Math.random() * 10000);
  return new User({
    username: `user_${rando}${num}`,
    email: `user_${rando}${num}@test.com`
  })
  .generatePasswordHash(`pass_${rando}`)
  .then( user => user.save())
  .then( user => {
    debug('saved user',user.username);
    debug('     email',user.email);
    _user = user;
    return user.generateToken();
  })
  .then( token => {
    debug('token:',token);
    _user.token = token;
    return _user;
  });
};
