const { Pool, Client } = require('pg')
const connectionString = 'postgresql://shekhar:shekhar@localhost:5432/metallica'

const pool = new Pool({
  connectionString: connectionString,
});

pool.query('SELECT * from commodity', (err, res) => {
  if(!err) {
    res.rows.forEach((row) => {
      console.log(row.code, row.description);
    });
  }
  pool.end()
});

function executeQuery(query) {
  const client = new Client({
    connectionString: connectionString,
  });
  client.connect();

  client.query(query, (err, res) => {
    if(!err) {
      res.rows.forEach((row) => {
        console.log(row.code, row.description);
      });
    }
    client.end();
  });
}

executeQuery('SELECT * from location');
executeQuery('SELECT * from counterparty');
