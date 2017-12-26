const config = require('./../../common/config');
const Sequelize = require('sequelize');

const defineRefDataSchema = require('./schema');

const dbHost = process.env.REF_DATA_DB_HOST;
const dbPort = process.env.REF_DATA_DB_PORT;
const dbName = process.env.REF_DATA_DB_NAME;
const dbUser = process.env.REF_DATA_DB_USER;
const dbPassword = process.env.REF_DATA_DB_PASSWORD;
const dbdialect = process.env.REF_DATA_DB_DIALECT;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbdialect,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Commodity = defineRefDataSchema(sequelize, 'commodity');
const commodityRows = [
  {
    code: 'AL',
    description: 'Aluminium'
  },
  {
    code: 'AG',
    description: 'Silver'
  },
  {
    code: 'AU',
    description: 'Gold'
  },
  {
    code: 'CU',
    description: 'Copper'
  },
  {
    code: 'ZN',
    description: 'Zinc'
  }
];
createRowsForEntity(Commodity, commodityRows);

const Counterparty = defineRefDataSchema(sequelize, 'counterparty');
const cpRows = [
  {
    code: 'AAPL',
    description: 'Apple'
  },
  {
    code: 'INFY',
    description: 'Infosys'
  },
  {
    code: 'ABCL',
    description: 'ABCL'
  }
];
createRowsForEntity(Counterparty, cpRows);

const Location = defineRefDataSchema(sequelize, 'location');
const locationRows = [
  {
    code: 'FRA',
    description: 'Frankfurt'
  },
  {
    code: 'LON',
    description: 'London'
  },
  {
    code: 'SGP',
    description: 'Singapore'
  },
  {
    code: 'NYC',
    description: 'New York'
  }
];
createRowsForEntity(Location, locationRows);

function createRowsForEntity(entity, rows, exit) {
  entity.sync({force: true}).then(() => {
    // Table created
     createRows(entity, rows);
  }).catch((reason) => console.log(reason));
}


function createRows(entity, rows) {
  rows.forEach((row) => {
    entity.create({code: row.code, description: row.description})
    .then(() => console.log("Row created for ", row.code));
  });
}
