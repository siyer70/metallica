const express = require('express'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  {mongoose} = require('./../common/db/mongoose.js'),
  {Trade, TradeSchema} = require('./../common/models/trademodel'),
  events = require('events'),
  Notifier = require('./../common/notifier');

var service = express();
service.use(bodyParser.json());

var myRequestLogger = function(req, res, next) {
  console.log("Request received: ", req.method, req.originalUrl);
  next();
}

service.use(myRequestLogger);

var em = new events.EventEmitter();
var notifier = new Notifier();
const EVENT_NAME = 'change';

em.on(EVENT_NAME, function(data) {
  notifier.notifyInTradeChannel(data.changeType, data.body);
});

service.get('/', (req, res) => {
  res.send('This is a trade command service!');
});

service.get('/info', (req, res) => {
  res.send('This is a trade command service!');
});

service.get('/health', (req, res) => {
  res.send("Response from tradecommandservice: I'm alive!");
});

service.post('/trades', (req, res) => {
  let tradeBody = _.pick(req.body, ['tradeDate', 'commodity', 'side', 'price',
    'quantity', 'counterparty', 'location', 'status']);

  console.log("Received new trade with trade body: ", tradeBody);

  let trade = new Trade(tradeBody);

  trade.save().then((trade) => {
    console.log('Saved trade', trade);
    em.emit(EVENT_NAME, {changeType: notifier.changeType.NEW, body: trade});
    res.send(trade);
  }, (e) => {
    console.log('Unable to save the trade', e);
    res.status(400).send(e);
  });

});

service.put('/trades/:id', (req, res) => {
  let id = req.params.id;

  let tradeBody = _.pick(req.body, ['tradeDate', 'commodity', 'side', 'price',
    'quantity', 'counterparty', 'location', 'status']);

  console.log(`Request received to update trade with id: ${id}`);

  console.log("with body: ", tradeBody);

  // perform validation
  let trade = new Trade(tradeBody);
  let error = trade.validateSync();
  if(error) {
    console.log(error.errors);
    return res.status(400).send();
  }

  Trade.findOneAndUpdate({tradeId: id}, {$set: tradeBody}, {new: true}).then((thisTrade) => {
    if (!thisTrade) {
      return res.status(404).send();
    }

    console.log('Updated trade', thisTrade);
    em.emit(EVENT_NAME, {changeType: notifier.changeType.UPDATE, body: thisTrade});
    res.send(thisTrade);
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  })
});

service.delete('/trades/:id', (req, res) => {
  let id = req.params.id;
  console.log("Request received to remove trade with id:", id);

  Trade.findOneAndRemove({tradeId:id}).then((thisTrade) => {
    if (!thisTrade) {
      return res.status(404).send();
    }

    console.log('Deleted trade', thisTrade);
    em.emit(EVENT_NAME, {changeType: notifier.changeType.DELETE, body: thisTrade});
    res.send(thisTrade);
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = {tradeCommandService : service};
