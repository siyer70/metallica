const amqp = require('amqplib/callback_api');
const socketIO = require('socket.io');
const events = require('events');

class NotificationService {
  constructor(app) {
    this.app = app;
    this.io = undefined;
  }

  setSocketIO(io) {
    this.io = io;
  }

  listenForEvents() {
    var em = new events.EventEmitter();
    const TRADE_EVENT_NAME = 'trade event';
    const MARKET_EVENT_NAME = 'market data event';

    var t = this;

    em.on(TRADE_EVENT_NAME, function(data) {
      if(t.io!==undefined) {
        t.io.emit(TRADE_EVENT_NAME, data);
      }
    });

    em.on(MARKET_EVENT_NAME, function(data) {
      if(t.io!==undefined) {
        t.io.emit(MARKET_EVENT_NAME, data);
      }
    });

    amqp.connect("amqp://localhost", function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = "tradequeue";
        ch.assertQueue(q, {durable : true});
        console.log(" [*] Waiting for messages in %s - press CTRL+C to exit", q);
        ch.consume(q, function(msg) {
          em.emit(TRADE_EVENT_NAME, msg.content.toString());
          console.log(" [x] Received message from %s queue - Message is: %s", q, msg.content.toString());
        }, {noAck : true});
      });

      conn.createChannel(function(err, ch) {
        var q = "marketdataqueue";
        ch.assertQueue(q, {durable : true});
        console.log(" [*] Waiting for messages in %s - press CTRL+C to exit", q);
        ch.consume(q, function(msg) {
          em.emit(MARKET_EVENT_NAME, msg.content.toString());
          console.log(" [x] Received message from %s queue - Message is: %s", q, msg.content.toString());
        }, {noAck : true});
      });

    });
  }
}

module.exports = NotificationService;
