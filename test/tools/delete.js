'use strict';

const request = require('superagent');

const PORT = process.argv[2];
const token = process.argv[3];
const gameId = process.argv[4];
const picId = process.argv[5];

if(!PORT) return console.error('PORT not specified');
if(!token) return console.error('token not specified');
if(!gameId) return console.error('gameId not specified');
if(!picId) return console.error('picId not specified');

const url = `http://localhost:${PORT}`;

request.delete(`${url}/api/game/${gameId}/pic/${picId}`)
.set({
  Authorization: `Bearer ${token}`
})
.end( (err, res) => {
  if(err) return console.error(err.message);
  console.log(res.status,res.body);
});
