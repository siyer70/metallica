'use strict'
const path =  require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const config = require('./../../common/config');
const NotificationService = require('./../notificationservice');

const publicPath = path.join(__dirname, './../../../public');
const port = process.env.NOTIFICATION_SERVICE_PORT || 3040;
var app = express();
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
