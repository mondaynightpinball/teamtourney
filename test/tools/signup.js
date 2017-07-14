'use strict';

const request = require('superagent');

const PORT = process.argv[2] || process.env.PORT || 5555;

const exampleUser = {
  username: 'theexampleplayer',
  email: 'somebody@example.com',
  password: '123abc'
};

const url = `http://localhost:${PORT}`;

request.post(`${url}/api/signup`)
.send(exampleUser)
.end( (err, res) => {
  if(err) return console.log(err.message);
  console.log(res.text);
});
