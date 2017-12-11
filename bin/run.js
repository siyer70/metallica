'use strict'
const http = require('http'),
  service = require('./../services/service');

console.log("Starting API Gateway...")
const server = http.createServer(service);
server.listen(3000);

server.on('listening', () => {
  console.log(`API Gateway running on ${server.address().port}`);
});
