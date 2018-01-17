const expect = require('expect');
const request = require('supertest');
require('./../../../services/common/configtest');

const launcher = require('./../../../services/tradecommandservice/launcher');
const {tradeCommandService} = require('./../../../services/tradecommandservice/tradecommandservice');
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

describe('POST /trades', () => {
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

    request(tradeCommandService).post('/trades')
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

    request(tradeCommandService).post('/trades')
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

describe('DELETE /trades/:id', () => {
  it('should delete the trade if valid tradeid is passed', (done) => {
    Trade.find({}).then((trades) => {
      let tradeId = trades[0].tradeId;
      console.log("Deleting trade with trade id: ", tradeId);
      request(tradeCommandService).delete('/trades/'+`${tradeId}`)
      .expect(200).expect((res) => {
        expect(res.body.tradeId).toBe(tradeId);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        done();
      });

    });

  });

  it('should NOT delete the trade if invalid tradeid is passed', (done) => {
      request(tradeCommandService).delete('/trades/-1')
      .expect(404)
      .end((err, res) => {
        if(err) {
          return done(err);
        }
        done();
      });
  });

});
