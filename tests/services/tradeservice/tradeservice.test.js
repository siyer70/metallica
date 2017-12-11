const expect = require('expect');
const request = require('supertest');

const launcher = require('./../../../services/tradeservice/launcher');
const {tradeService} = require('./../../../services/tradeservice/tradeservice');
const {Trade} = require('./../../../services/tradeservice/models/trademodel');

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

describe('POST /services/tradeService/trades', () => {
  it('should create a new trade', (done) => {
    var tradeData = {
    	"tradeDate":"2017-12-05T10:45:15.500Z",
    	"commodity": "ZN",
    	"side": "Buy",
    	"price": 795.47,
    	"quantity": 50,
    	"counterparty": "INFY",
    	"location": "DEL",
      "status": "OPEN"
    }

    request(tradeService).post('/services/tradeService/trades')
    .send(tradeData).expect(200).expect((res) => {
      expect(res.body.commodity).toBe("ZN");
    })
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Trade.find({location:"DEL"}).then((trades) => {
        expect(trades.length).toBe(1);
        expect(trades[0].commodity).toBe("ZN");
        done();
      }).catch((e) => done(e));
    });
  });

  it('should NOT create a new trade with invalid body data', (done) => {
    // key fields commodity, side are missing in body, hence should fail
    var tradeData = {
    	"tradeDate":"2017-12-05T10:45:15.500Z",
    	"price": 795.47,
    	"quantity": 50,
    	"counterparty": "INFY",
    	"location": "DEL",
      "status": "NOMINATED"
    }

    request(tradeService).post('/services/tradeService/trades')
    .send(tradeData).expect(400)
    .end((err, res) => {
      if(err) {
        return done(err);
      }

      Trade.find({location:"DEL"}).then((trades) => {
        expect(trades.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });

});

describe('GET /services/tradeService/trades', () => {
  it('should list all trades in db', (done) => {
    request(tradeService).get('/services/tradeService/trades')
    .expect(200).expect((res) => {
      expect(res.body.trades.length).toBe(2);
    })
    .end(done);
  });
});
