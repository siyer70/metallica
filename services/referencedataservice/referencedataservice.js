const express = require('express'),
  bodyParser = require('body-parser');
const config = require('./../common/config');
const Sequelizer = require('./sequelizer');

const { Pool, Client } = require('pg')
const connectionString = process.env.POSTGRES_URI;

this.sequelizer = new Sequelizer();
var service = express();
service.use(bodyParser.json());

var myRequestLogger = function(req, res, next) {
  console.log("Request received: ", req.method, req.originalUrl);
  next();
}

service.use(myRequestLogger);

service.get('/', (req, res) => {
  res.send('This is a Reference data service!');
});


service.get('/info', (req, res) => {
  res.send('This is a Reference data service!');
});

service.get('/health', (req, res) => {
  res.send("Response from reference data service: I'm alive!");
});


service.get('/commodities', (req, res) => {
  try {
    executeQuery(this.sequelizer.getSchema('commodity'), (commodities) => {
      res.send({commodities});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

service.get('/locations', (req, res) => {
  try {
    executeQuery(this.sequelizer.getSchema( 'location'), (locations) => {
      res.send({locations});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

service.get('/counterparties', (req, res) => {
  try {
    executeQuery(this.sequelizer.getSchema('counterparty'), (counterparties) => {
      res.send({counterparties});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

function executeQuery(entity, cb) {
  entity.findAll().then(rows => {
    rows.forEach((row) => {
      console.log(row.code, row.description);
    });
    cb(rows);
  });
}

module.exports = {refdataService : service};
