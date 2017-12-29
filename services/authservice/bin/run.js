'use strict'
const http = require('http'),
  authService = require('./../authservice'),
  config = require('./../../common/config');

var port = process.env.AUTHSERVER_PORT || 4350;
console.log("Starting Auth Server...")
const server = http.createServer(authService);
server.listen(port);

server.on('listening', () => {
  console.log(`OAuth2 Server running on ${server.address().port}`);
});
