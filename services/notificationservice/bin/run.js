'use strict'
const path =  require('path');
//const https = require('https');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const config = require('./../../common/config');
const NotificationService = require('./../notificationservice');
const fs = require('fs');

const publicPath = path.join(__dirname, './../../../public');
const port = process.env.NOTIFICATION_SERVICE_PORT || 3040;
var app = express();

// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
// const options = {
//   key  : fs.readFileSync(path.join(__dirname, '../certs/privatekey.pem')),
//   cert : fs.readFileSync(path.join(__dirname, 'certs/certificate.pem')),
// };

// Create our HTTPS server listening on port 3000.
// var server = https.createServer(options, app);

var server = http.createServer(app);


var io = socketIO(server);
app.use(express.static(publicPath));

console.log("Starting Notification Service...")
var notificationService = new NotificationService(app);
notificationService.listenForEvents();

var clients = [];

io.on('connection', (socket) => {
    console.log('New connection event received from client', socket.id);
    clients.push(socket.id);

    notificationService.setSocketIO(io);

    socket.on('disconnect', (socket) => {
        clients = clients.filter((id) => id !== socket.id);
        if(clients.length===0) {
          notificationService.setSocketIO(undefined);
        }
        console.log('Client disconnected event received');
    });

});

server.listen(port, () => {
  console.log(`Notification Service up for Socket IO on port ${port}`);
});
