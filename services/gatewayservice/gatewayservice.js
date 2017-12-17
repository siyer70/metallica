'use strict'
const path =  require('path');
const express = require('express');

const service = express();

const publicPath = path.join(__dirname, './../../public');
service.use(express.static(publicPath));

const ServiceRegistry = require('./../registryservice/serviceRegistry');
const serviceRegistry = new ServiceRegistry();

service.set('serviceRegistry', serviceRegistry);

service.put('/services/:intent/:port', (req, res, next) => {
  console.log("Service registry request received");

  const serviceIntent = req.params.intent;
  const servicePort = req.params.port;

  const serviceIP = req.connection.remoteAddress.includes('::')
      ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
  serviceRegistry.add(serviceIntent, serviceIP, servicePort);
  res.json({result: `${serviceIntent} at ${serviceIP}:${servicePort}`});
});

module.exports = service;
