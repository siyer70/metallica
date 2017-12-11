'use strict'

class ServiceRegistry {
  constructor() {
    this._services = [];
    this._timeout = 30;
  }

  add(serviceName, ip, port) {
    const key = serviceName + ip + port;
    if(!this._services[key]) {
      this._services[key] = {};
      this._services[key].timestamp = Math.floor(new Date() / 1000);
      this._services[key].serviceName = serviceName;
      this._services[key].ip = ip;
      this._services[key].port = port;

      console.log(`Added the service to the registry with the name '${serviceName}' on ip:port ${ip}:${port}`);
      this._cleanup();
      return;
    }

    this._services[key].timestamp = Math.floor(new Date() / 1000);
    console.log(`Updated the service to the registry with the name '${serviceName}' on ip:port ${ip}:${port}`);
    this._cleanup();
  }

  remove(serviceName, ip, port) {
    if(this._services[key]) {
      delete this._services[key];
      console.log(`Removed the service from the registry with the name '${serviceName}' on ip:port ${ip}:${port}`);
      return;
    }

    console.log(`No such service found in the registry with the name '${serviceName}' on ip:port ${ip}:${port}`);
  }

  get(serviceName) {
    this._cleanup();
    console.log(`Received request to locate '${serviceName}' service in registry`);
    for(let key in this._services) {
      if(this._services[key].serviceName === serviceName) {
        let ip = this._services[key].ip;
        let port = this._services[key].port;
        console.log(`Located '${serviceName}' service in registry - returning ${ip}:${port}`);
        return this._services[key];
      }
    }
    return null;
  }

  _cleanup() {
    let now = new Date() / 1000;
    for(let key in this._services) {
      if(this._services[key].timestamp + this._timeout < now) {
        console.log(`Service with the name '${serviceName}' on ip:port ${ip}:${port} expired - removed from the registry`);
        delete this._services[key];
      }
    }
  }

}

module.exports = ServiceRegistry;
