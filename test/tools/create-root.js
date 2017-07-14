'use strict';
const mongoose = require('mongoose');
const Promise = require('bluebird');
mongoose.Promise = Promise;

require('dotenv').load();

const User = require('../../model/user.js');

// NOTE This is really sensitive, but is only intended
//      as an emergency or start-up utility to set
//      the root password.
const password = process.argv[2];

mongoose.connect(process.env.MONGODB_URI)
.then( () => createRoot(password))
.catch( err => console.log(err));


function createRoot(password) {
  if(!password) return console.log('Password required');

  console.log('createRoot....');

  User.findOne({ username: 'root' })
  .then( user => {
    console.log('user:', user);
    if(!user) {
      //Create a new user.
      user = new User({
        username: 'root',
        email: 'service@mondaynightpinball.com'
      });
    }
    return user.generatePasswordHash(password);
  })
  .then( user => {
    console.log('... created password hash ...');
    return user.generateToken();
  })
  .then( token => console.log('TOKEN:', token))
  .catch( err => console.log(err));
}
