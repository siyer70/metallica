const Sequelize = require('sequelize');

const DefineRefDataSchema = (sequelize, schemaName) => {
    return sequelize.define(schemaName, {
      code: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      }
    });
}

module.exports = DefineRefDataSchema;
