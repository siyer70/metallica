'use strict'
const http = require('http'),
  service = require('./../services/service'),
  config = require('./../services/common/config');

var port = process.env.GATEWAY_PORT || 3000;
console.log("Starting API Gateway...")
const server = http.createServer(service);
server.listen(port);

server.on('listening', () => {
  console.log(`API Gateway running on ${server.address().port}`);
});
