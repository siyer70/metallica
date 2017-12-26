const config = require('./../common/config');
const Sequelize = require('sequelize');
const defineRefDataSchema = require('./schema');

class Sequelizer {
  constructor() {
    const dbHost = process.env.REF_DATA_DB_HOST;
    const dbPort = process.env.REF_DATA_DB_PORT;
    const dbName = process.env.REF_DATA_DB_NAME;
    const dbUser = process.env.REF_DATA_DB_USER;
    const dbPassword = process.env.REF_DATA_DB_PASSWORD;
    const dbdialect = process.env.REF_DATA_DB_DIALECT;

    this.sequelize = new Sequelize(dbName, dbUser, dbPassword, {
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

    this.sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch(err => {
        console.error('Unable to connect to the database:', err);
      });
  }

  getSchema(entityName) {
    return defineRefDataSchema(this.sequelize, entityName);
  }

}

module.exports = Sequelizer;
