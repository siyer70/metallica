const MarketDataService = require('./../marketdataservice');

var service = new MarketDataService();
var timerRef = service.start();

function stopTheService() {
  service.stop(timerRef);
}

//setTimeout(stopTheService, 5000);
