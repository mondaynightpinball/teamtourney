'use strict';

const request = require('superagent');

const PORT = process.argv[2];
const token = process.argv[3];
const type = process.argv[4] || 'singles';

if(!PORT) return console.error('PORT not specified');
if(!token) return console.error('token not specified');

const url = `http://localhost:${PORT}`;

request.post(`${url}/api/game`)
.send({ type: type })
.set({
  Authorization: `Bearer ${token}`
})
.end( (err, res) => {
  if(err) return console.error(err.message);
  console.log(res.body);
});
