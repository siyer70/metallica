Notifier = require('./../common/notifier');

// This is just a simulated service - not actually be hitting the external site for now
class MarketDataService {
  constructor() {
    this._prices = {};
    // add an entry
    this._prices['AU'] = {code: 'AU', name: 'Gold', date: new Date(), unit:'1 oz', currency:'USD', price: 1250.29};
    this._prices['AG'] = {code: 'AU', name: 'Silver', date: new Date(), unit:'1 oz', currency: 'USD', price: 15.87};
    this._prices['CU'] = {code: 'CU', name: 'Copper', date: new Date(), unit:'1 mt', currency: 'USD', price: 6595.76};
    this._prices['ZN'] = {code: 'ZN', name: 'Zinc', date: new Date(), unit:'1 mt', currency: 'USD', price: 3093.00};
    this._prices['AL'] = {code: 'AL', name: 'Aluminium', date: new Date(), unit:'1 ', currency: 'USD', price: 2010.65};
    this.notifier = new Notifier();
  }

  start() {
    console.log('starting Market Data Service...');
    var t = this;
    return setInterval(function() {t._simulatePriceChange();}, 2000);
  }

  stop(timerRef) {
    clearInterval(timerRef);
    console.log('stopped the Market Data Service.')
  }

  _simulatePriceChange() {
    for(let key in this._prices) {
      var price = this._prices[key].price;
      var upOrDown = (this._getRandomInt(0, 1)===0)?'-':'+';
      var newFactor = (Number(price) * (Math.random() / 10000));
      let newPrice=0;
      if(upOrDown==='+')
        newPrice = Number(price) + newFactor;
      else
        newPrice = Number(price) - newFactor;
      newPrice = newPrice.toFixed(2);
      if(price !== newPrice) {
        this._prices[key].price = newPrice;
        this.notifier.notifyInMarketDataChannel(this._prices[key]);
        console.log('Notified price changes for %s from %d to %d', this._prices[key].name, price, newPrice);
      }
    }
  }

  _getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = MarketDataService;
