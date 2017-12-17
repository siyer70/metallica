'use strict'
const request = require('superagent');
const http = require('http');
const config = require('./../common/config');
const {tradeService} = require('./tradeservice');

function launch(registerPeriodically) {
  const server = http.createServer(tradeService);

  //In Production, no need to set this env variable
  const LISTENPORT = process.env.TRADE_SERVICE_PORT;
  if(LISTENPORT===undefined)
    server.listen();
  else
    server.listen(LISTENPORT);

  server.on('listening', function() {
    console.log(`Trade Service started on port ${server.address().port}`);

    if(!registerPeriodically) return;

    const announce = () => {
      const SERVICE_DISCOVERY_PROTOCOL = process.env.SERVICE_DISCOVERY_PROTOCOL || 'http';
      const SERVICE_DISCOVERY_HOST = process.env.SERVICE_DISCOVERY_HOST || '127.0.0.1';
      const SERVICE_DISCOVERY_PORT = process.env.SERVICE_DISCOVERY_PORT || 3000;
      const BASE_URL = `${SERVICE_DISCOVERY_PROTOCOL}://${SERVICE_DISCOVERY_HOST}:${SERVICE_DISCOVERY_PORT}`;
      console.log('Registering Trade service in service locator running in :', BASE_URL);
      request.put(`${BASE_URL}/services/tradeService/${server.address().port}`,
      (err, res) => {
          if(err) console.log("Error occurred while registering the service in service locator", err);
      });
    };
    announce();
    const REGISTER_INTERVAL_IN_SECONDS = process.env.REGISTER_INTERVAL_IN_SECONDS || 15;
    setInterval(announce, REGISTER_INTERVAL_IN_SECONDS*1000);
  });
}

module.exports = {launch};
