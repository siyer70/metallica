const amqp = require('amqplib');

class Notifier {
    constructor() {
      this.changeType = {
        NEW : 'New',
        UPDATE: 'Update',
        DELETE : 'Delete'
      }
      this.amqpConnection = amqp.connect("amqp://localhost");
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
        var q = "tradequeue";
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
        var q = "marketdataqueue";
        ch.assertQueue(q, {durable : true});
        var jsonStr = JSON.stringify(marketDataBody);
        ch.sendToQueue(q, new Buffer(jsonStr), {persistent : true});
        console.log(" [x] Sent message to %s queue - message is: %s", q, jsonStr);
      }, function(err) {console.log(err)});
    }
}

module.exports = Notifier;
