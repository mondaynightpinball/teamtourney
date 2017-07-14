'use strict';

const request = require('superagent');

const PORT = process.argv[2];
const token = process.argv[3];
const gameId = process.argv[4];
const image = process.argv[5] || '../data/tester.jpeg';

if(!PORT) return console.error('PORT not specified');
if(!token) return console.error('token not specified');
if(!gameId) return console.error('gameId not specified');

const url = `http://localhost:${PORT}`;

request.post(`${url}/api/game/${gameId}/pic`)
.set({
  Authorization: `Bearer ${token}`
})
.attach('image', image)
.end( (err, res) => {
  if(err) return console.error(err.message);
  console.log(res.body);
});
