const expect = require('expect');
const request = require('supertest');
require('./../../../services/common/configtest');

const launcher = require('./../../../services/tradequeryservice/launcher');
const {tradeQueryService} = require('./../../../services/tradequeryservice/tradequeryservice');
const {Trade} = require('./../../../services/common/models/trademodel');

beforeEach((done) => {
  let trades = [];
  let tradeData = {
    "tradeDate":"2017-12-05T10:45:15.500Z",
    "commodity": "AU",
    "side": "Buy",
    "price": 43.273,
    "quantity": 10,
    "counterparty": "INFY",
    "location": "NYC",
    "status": "OPEN"
  }
  trades.push(tradeData);
  var newtrade = JSON.parse(JSON.stringify(tradeData));
  newtrade.side = "Sell";
  newtrade.commodity = "AG";
  newtrade.price = 623.502;
  newtrade.quantity = 1000;
  newtrade.status = "NOMINATED";
  trades.push(newtrade);

  try {
    Trade.remove({}).then(() => {
      var promises = [];
      trades.forEach((mytrade) => {
        let thisTrade = new Trade(mytrade);
        promises.push(thisTrade.save());
      });
      return Promise.all(promises);
    }, (e) => {
      console.log("An error occurred while removing trades", e);
      done();
    }).then(() => done(), (e) => {
      console.log("An error occurred while saving trades", e);
      done();
    });
  } catch(e) {
    console.log("An error occurred setting up the test environment", e);
    done();
  }
});

describe('GET /trades', () => {
  it('should list all trades in db', (done) => {
    request(tradeQueryService).get('/trades')
    .expect(200).expect((res) => {
      expect(res.body.trades.length).toBe(2);
    })
    .end(done);
  });
});
