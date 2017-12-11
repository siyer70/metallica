'use strict'
const request = require('superagent');
const {tradeService} = require('./tradeservice');
const http = require('http');

function launch(registerPeriodically) {
  const server = http.createServer(tradeService);

  //TODO - kept only for testing - later remove hard coded port number
  server.listen();

  server.on('listening', function() {
    console.log(`Trade Service started on port ${server.address().port}`);

    if(!registerPeriodically) return;

    const announce = () => {
      request.put(`http://127.0.0.1:3000/services/tradeService/${server.address().port}`,
      (err, res) => {
          if(err) console.log("Error occurred while registering the service to service registry", err);
      });
    };
    announce();
    setInterval(announce, 15*1000);
  });
}

module.exports = {launch};
