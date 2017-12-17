const amqp = require('amqplib');
const config = require('./config');
const TRADE_QUEUE_NAME = process.env.TRADE_NOTIFICATION_QUEUE_NAME || "tradequeue";
const MARKET_DATA_QUEUE_NAME = process.env.MARKET_DATA_NOTIFICATION_QUEUE_NAME || "marketdataqueue";

class Notifier {
    constructor() {
      this.changeType = {
        NEW : 'New',
        UPDATE: 'Update',
        DELETE : 'Delete'
      }
      var mqHost = process.env.RABBITMQ_HOST || 'localhost';
      console.log("Connecting to Rabbit MQ Host:", mqHost);
      console.log("Trade notification queue Name:", TRADE_QUEUE_NAME);
      console.log("Market Data notification queue Name:", MARKET_DATA_QUEUE_NAME);
      this.amqpConnection = amqp.connect("amqp://" + mqHost);
      this.amqpTradeChannel = undefined;
      this.amqpMarketDataChannel = undefined;
    }

    notifyInTradeChannel(changeType, tradeBody) {
      var channel = this.amqpTradeChannel;
      var n = this;
      this.amqpConnection.then(function(conn) {
        if(channel === undefined) {
          n.amqpTradeChannel = conn.createChannel();
          channel = n.amqpTradeChannel;
        }
        return channel;
      }, function(err) {console.log(err)})
      .then(function(ch) {
        var q = TRADE_QUEUE_NAME;
        ch.assertQueue(q, {durable : true});
        var tradeMessage = {changeType, tradeId: tradeBody.tradeId, tradeBody};
        var jsonStr = JSON.stringify(tradeMessage);
        ch.sendToQueue(q, new Buffer(jsonStr), {persistent : true});
        console.log(" [x] Sent message to %s queue - message is: %s", q, jsonStr);
      }, function(err) {console.log(err)});
    }

    notifyInMarketDataChannel(marketDataBody) {
      var channel = this.amqpMarketDataChannel;
      var n = this;
      this.amqpConnection.then(function(conn) {
        if(channel === undefined) {
          n.amqpMarketDataChannel = conn.createChannel();
          channel = n.amqpMarketDataChannel;
        }
        return channel;
      }, function(err) {console.log(err)})
      .then(function(ch) {
        var q = MARKET_DATA_QUEUE_NAME;
        ch.assertQueue(q, {durable : true});
        var jsonStr = JSON.stringify(marketDataBody);
        ch.sendToQueue(q, new Buffer(jsonStr), {persistent : true});
        console.log(" [x] Sent message to %s queue - message is: %s", q, jsonStr);
      }, function(err) {console.log(err)});
    }
}

module.exports = Notifier;
