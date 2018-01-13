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
  res.send('This is a trade query service!');
});


service.get('/info', (req, res) => {
  res.send('This is a trade query service!');
});

service.get('/health', (req, res) => {
  res.send("Response from tradequeryservice: I'm alive!");
});

service.get('/trades', (req, res) => {
  Trade.find().then((trades) => {
    res.send({trades});
  }, (e) => {
    res.status(400).send(e);
  });
});

service.get('/trades/:dtrange/:com/:side/:cp/:location', (req, res) => {
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


service.get('/trades/:id', (req, res) => {
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

module.exports = {tradeQueryService : service};
