const config = require('./../common/config');
const Sequelize = require('sequelize');
const defineRefDataSchema = require('./schema');
const Sequelizer = require('./sequelizer');

class DataSeeder {
  constructor() {
    this.sequelizer = new Sequelizer();
  }

  seed() {
    const Commodity = this.sequelizer.getSchema('commodity');
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
    this._createRowsForEntity(Commodity, commodityRows);

    const Counterparty = this.sequelizer.getSchema('counterparty');
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
    this._createRowsForEntity(Counterparty, cpRows);

    const Location = this.sequelizer.getSchema( 'location');
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
    this._createRowsForEntity(Location, locationRows);
  }

  _createRowsForEntity(entity, rows, exit) {
    entity.sync({force: true}).then(() => {
      // Table created
       this._createRows(entity, rows);
    }).catch((reason) => console.log(reason));
  }

  _createRows(entity, rows) {
    rows.forEach((row) => {
      entity.create({code: row.code, description: row.description})
      .then(() => console.log("Row created for ", row.code));
    });
  }

}

module.exports = DataSeeder;
