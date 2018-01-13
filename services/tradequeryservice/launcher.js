'use strict'
const request = require('superagent');
const http = require('http');
const config = require('./../common/config');
const {tradeQueryService} = require('./tradequeryservice');
const Eureka = require('eureka-js-client').Eureka;

function launch(registerPeriodically) {
  const server = http.createServer(tradeQueryService);

  //In Production, no need to set this env variable
  const LISTENPORT = process.env.TRADE_QUERY_SERVICE_PORT;
  if(LISTENPORT===undefined)
    server.listen();
  else
    server.listen(LISTENPORT);

  server.on('listening', function() {
    console.log(`Trade Query Service started on port ${server.address().port}`);
    let tsProtocol = process.env.TRADE_QUERY_SERVICE_PROTOCOL || 'http';
    let tsHostName = process.env.TRADE_QUERY_SERVICE_HOSTNAME || 'localhost';
    let tsIpAddr = process.env.TRADE_QUERY_SERVICE_IPADDRESS || '127.0.0.1';
    let tsPort = `${server.address().port}`;
    let tsApp = process.env.TRADE_QUERY_SERVICE_APP_REGISTRY_NAME || 'tradequeryservice';
    let tsVipAddress = process.env.TRADE_QUERY_SERVICE_APP_REGISTRY_NAME || tsApp;
    let tsHostPort = `${tsHostName}:${tsPort}`;
    let tsBaseUrl = tsProtocol + "://" + tsHostPort;
    let tsDCName = process.env.TRADE_QUERY_SERVICE_DATACENTER_NAME || 'MyOwn';
    let tsDCClass = process.env.TRADE_QUERY_SERVICE_DATACENTER_CLASS ||
                  'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo';
    let eurekaHost = process.env.EUREKA_SERVER_HOSTNAME || 'localhost';
    let eurekaPort = process.env.EUREKA_SERVER_PORT || 8761;
    let eurekaServicePath = process.env.EUREKA_SERVER_SERVICEPATH || '/eureka/apps/';

    const client = new Eureka({
      instance: {
        instanceId: tsHostPort,
        app: tsApp,
        hostName: tsHostName,
        ipAddr: tsIpAddr,
        statusPageUrl:`${tsBaseUrl}/info`,
        healthCheckUrl:`${tsBaseUrl}/health`,
        port: {
          '$' : tsPort,
          '@enabled': true,
        },
        vipAddress: tsVipAddress,
        dataCenterInfo: {
          '@class': tsDCClass,
          name: tsDCName,
        },
      },
      eureka: {
        // eureka server host / port
        host: eurekaHost,
        port: eurekaPort,
        servicePath: eurekaServicePath
      },
    });

    client.logger.level('debug');
    client.start((error) => {
      if(error) console.log('Error Occurred');
      console.log(error || 'completed');
    });

    // const instances = client.getInstancesByAppId('tradeQueryService');
    // console.log(instances);

    if(!registerPeriodically) return;

    const announce = () => {
      const SERVICE_DISCOVERY_PROTOCOL = process.env.SERVICE_DISCOVERY_PROTOCOL || 'http';
      const SERVICE_DISCOVERY_HOST = process.env.SERVICE_DISCOVERY_HOST || '127.0.0.1';
      const SERVICE_DISCOVERY_PORT = process.env.SERVICE_DISCOVERY_PORT || 3000;
      const BASE_URL = `${SERVICE_DISCOVERY_PROTOCOL}://${SERVICE_DISCOVERY_HOST}:${SERVICE_DISCOVERY_PORT}`;
      console.log('Registering trade query service in service locator running in :', BASE_URL);
      request.put(`${BASE_URL}/services/tradequeryservice/${server.address().port}`,
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
