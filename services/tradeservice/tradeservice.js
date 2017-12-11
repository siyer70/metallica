const express = require('express'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  {mongoose} = require('./db/mongoose.js'),
  {Trade, TradeSchema} = require('./models/trademodel'),
  events = require('events'),
  Notifier = require('./../common/notifier');

var service = express();
service.use(bodyParser.json());

var em = new events.EventEmitter();
var notifier = new Notifier();
const EVENT_NAME = 'change';

em.on(EVENT_NAME, function(data) {
  notifier.notifyInTradeChannel(data.changeType, data.body);
});

service.post('/services/tradeService/trades', (req, res) => {
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

service.get('/services/tradeService/trades', (req, res) => {
  Trade.find().then((trades) => {
    res.send({trades});
  }, (e) => {
    res.status(400).send(e);
  });
});

service.get('/services/tradeService/trades/:dtrange/:com/:side/:cp/:location', (req, res) => {
  console.log("Query request received with params: ", req.params);

  let dtrange = req.params.dtrange;
  let commodity = req.params.com;
  let side = req.params.side;
  let cp = req.params.cp;
  let location = req.params.location;

  if(dtrange.indexOf(',')=== -1)
    res.status(400).send();

  // expected date pattern in date range is - yyyymmdd,yyyymmdd
  var pattern = /(\d{4})(\d{2})(\d{2})/;
  dtfrom = new Date(dtrange.split(',')[0].replace(pattern, "$1-$2-$3"));
  dtTo = new Date(dtrange.split(',')[1].replace(pattern, "$1-$2-$3"));

  var query = Trade.find()
    .where('tradeDate').gte(dtfrom)
    .where('tradeDate').lte(dtTo);

  if(commodity!=='ALL') query.where('commodity').equals(commodity);
  if(side!=='ALL') query.where('side').equals(side);
  if(cp!=='ALL') query.where('counterparty').equals(cp);
  if(location!='ALL') query.where('location').equals(location);

  console.log(query._conditions);

  query.then((trades) => {
    res.send({trades});
  }, (e) => {
    res.status(400).send(e);
  });
});


service.get('/services/tradeService/trades/:id', (req, res) => {
  let id = req.params.id;
  console.log("Request received to retrieve trade with id:", id);

  Trade.findOne({tradeId:id}).then((thisTrade) => {
    if (!thisTrade) {
      return res.status(404).send();
    }

    res.send(thisTrade);
  }).catch((e) => {
    res.status(400).send();
  });
});

service.patch('/services/tradeService/trades/:id', (req, res) => {
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

service.delete('/services/tradeService/trades/:id', (req, res) => {
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


module.exports = {tradeService : service};
