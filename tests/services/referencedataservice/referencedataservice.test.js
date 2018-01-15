const expect = require('expect');
const request = require('supertest');
require('./../../../services/common/configtest');

const launcher = require('./../../../services/referencedataservice/launcher');
const {refdataService} = require('./../../../services/referencedataservice/referencedataservice');

describe('GET /commodities', () => {
  it('should list all commodities in db', (done) => {
    request(refdataService).get('/commodities')
    .expect(200).expect((res) => {
      expect(res.body.commodities.length).toBe(5);
    })
    .end(done);
  });
});

describe('GET /locations', () => {
  it('should list all locations in db', (done) => {
    request(refdataService).get('/locations')
    .expect(200).expect((res) => {
      expect(res.body.locations.length).toBe(4);
    })
    .end(done);
  });
});

describe('GET /counterparties', () => {
  it('should list all counterparties in db', (done) => {
    request(refdataService).get('/counterparties')
    .expect(200).expect((res) => {
      expect(res.body.counterparties.length).toBe(3);
    })
    .end(done);
  });
});
