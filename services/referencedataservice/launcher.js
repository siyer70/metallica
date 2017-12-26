'use strict'
const request = require('superagent');
const http = require('http');
const config = require('./../common/config');
const {refdataService} = require('./referencedataservice');
const Eureka = require('eureka-js-client').Eureka;

function launch(registerPeriodically) {
  let toSeedData = (process.env.SEED_REF_DATA_ON_STARTUP || "false") === "true";

  if(toSeedData) {
    console.log("Seeding data");
    const DataSeeder = require('./seeddata.js');
    let dataSeeder = new DataSeeder();
    dataSeeder.seed();
  }

  const server = http.createServer(refdataService);

  //In Production, no need to set this env variable
  const LISTENPORT = process.env.REFERENCE_DATA_SERVICE_PORT;
  if(LISTENPORT===undefined)
    server.listen();
  else
    server.listen(LISTENPORT);

  server.on('listening', function() {
    console.log(`Reference Data Service started on port ${server.address().port}`);

    let rdsProtocol = process.env.REFERENCE_DATA_SERVICE_PROTOCOL || 'http';
    let rdsHostName = process.env.REFERENCE_DATA_SERVICE_HOSTNAME || 'localhost';
    let rdsIpAddr = process.env.REFERENCE_DATA_SERVICE_IPADDRESS || '127.0.0.1';
    let rdsPort = `${server.address().port}`;
    let rdsApp = process.env.REFERENCE_DATA_SERVICE_APP_REGISTRY_NAME || 'refdataservice';
    let rdsVipAddress = process.env.REFERENCE_DATA_SERVICE_APP_REGISTRY_NAME || rdsApp;
    let rdsHostPort = `${rdsHostName}:${rdsPort}`;
    let rdsBaseUrl = rdsProtocol + "://" + rdsHostPort;
    let rdsDCName = process.env.REFERENCE_DATA_SERVICE_DATACENTER_NAME || 'MyOwn';
    let rdsDCClass = process.env.REFERENCE_DATA_SERVICE_DATACENTER_CLASS ||
                  'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo';
    let eurekaHost = process.env.EUREKA_SERVER_HOSTNAME || 'localhost';
    let eurekaPort = process.env.EUREKA_SERVER_PORT || 8761;
    let eurekaServicePath = process.env.EUREKA_SERVER_SERVICEPATH || '/eureka/apps/';

    const client = new Eureka({
      instance: {
        instanceId: rdsHostPort,
        app: rdsApp,
        hostName: rdsHostName,
        ipAddr: rdsIpAddr,
        statusPageUrl:`${rdsBaseUrl}/info`,
        healthCheckUrl:`${rdsBaseUrl}/health`,
        port: {
          '$' : rdsPort,
          '@enabled': true,
        },
        vipAddress: rdsVipAddress,
        dataCenterInfo: {
          '@class': rdsDCClass,
          name: rdsDCName,
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

    if(!registerPeriodically) return;

    const announce = () => {
      const SERVICE_DISCOVERY_PROTOCOL = process.env.SERVICE_DISCOVERY_PROTOCOL || 'http';
      const SERVICE_DISCOVERY_HOST = process.env.SERVICE_DISCOVERY_HOST || '127.0.0.1';
      const SERVICE_DISCOVERY_PORT = process.env.SERVICE_DISCOVERY_PORT || 3000;
      const BASE_URL = `${SERVICE_DISCOVERY_PROTOCOL}://${SERVICE_DISCOVERY_HOST}:${SERVICE_DISCOVERY_PORT}`;
      console.log('Registering Ref data service in service locator running in :', BASE_URL);
      request.put(`${BASE_URL}/services/refdataService/${server.address().port}`,
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
