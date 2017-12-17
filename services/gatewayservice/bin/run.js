'use strict'
const http = require('http'),
  gatewayService = require('./../gatewayservice'),
  config = require('./../../common/config');

var port = process.env.GATEWAY_PORT || 3000;
console.log("Starting API Gateway...")
const server = http.createServer(gatewayService);
server.listen(port);

server.on('listening', () => {
  console.log(`API Gateway running on ${server.address().port}`);
});
