const express = require('express'),
  bodyParser = require('body-parser');
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://shekhar:shekhar@localhost:5432/metallica'

var service = express();
service.use(bodyParser.json());

service.get('/services/refdataService/commodities', (req, res) => {
  try {
    executeQuery('SELECT * from commodity', (commodities) => {
      res.send({commodities});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

service.get('/services/refdataService/locations', (req, res) => {
  try {
    executeQuery('SELECT * from location', (locations) => {
      res.send({locations});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

service.get('/services/refdataService/counterparties', (req, res) => {
  try {
    executeQuery('SELECT * from counterparty', (counterparties) => {
      res.send({counterparties});
    });
  } catch(e) {
    res.status(400).send(e);
  }
});

function executeQuery(query, cb) {
  const client = new Client({
    connectionString: connectionString,
  });
  client.connect();

  var rows = [];

  client.query(query, (err, res) => {
    if(!err) {
      res.rows.forEach((row) => {
        rows.push(row);
        console.log(row.code, row.description);
      });
    }
    cb(rows);
    client.end();
  });
}

module.exports = {refdataService : service};
