'use strict';

const User = require('../../model/user.js');

module.exports = function() {
  let _user = {};
  return new User({
    username: 'root',
    email: 'service@mondaynightpinball.com'
  })
  .generatePasswordHash('root_pw')
  .then( user => user.save())
  .then( user => {
    _user = user;
    return user.generateToken();
  })
  .then( token => {
    _user.token = token;
    return _user;
  });
};
