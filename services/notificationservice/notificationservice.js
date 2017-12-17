const amqp = require('amqplib/callback_api');
const socketIO = require('socket.io');
const events = require('events');
const config = require('./../common/config');


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
    const TRADE_QUEUE_NAME = process.env.TRADE_NOTIFICATION_QUEUE_NAME || "tradequeue";
    const MARKET_DATA_QUEUE_NAME = process.env.MARKET_DATA_NOTIFICATION_QUEUE_NAME || "marketdataqueue";
    const MQHOST = process.env.RABBITMQ_HOST || 'localhost';

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

    console.log("Connecting to Rabbit MQ Host:", MQHOST);
    console.log("Trade notification queue Name:", TRADE_QUEUE_NAME);
    console.log("Market Data notification queue Name:", MARKET_DATA_QUEUE_NAME);
    amqp.connect("amqp://" + MQHOST, function(err, conn) {
      conn.createChannel(function(err, ch) {
        var q = TRADE_QUEUE_NAME;
        ch.assertQueue(q, {durable : true});
        console.log(" [*] Waiting for messages in %s - press CTRL+C to exit", q);
        ch.consume(q, function(msg) {
          em.emit(TRADE_EVENT_NAME, msg.content.toString());
          console.log(" [x] Received message from %s queue - Message is: %s", q, msg.content.toString());
        }, {noAck : true});
      });

      conn.createChannel(function(err, ch) {
        var q = MARKET_DATA_QUEUE_NAME;
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
