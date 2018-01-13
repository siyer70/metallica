var mongoose = require('mongoose'),
  validate = require('mongoose-validator'),
  Schema = mongoose.Schema;

var sequenceGenerator = require('./../../common/sequence-generator.js');

const TRADE_MODEL_NAME = 'Trade';

// sequence instance
var sequence = sequenceGenerator('trade');

var sideValidator = [
  validate({
    validator: function(val) {
      let validStatus = ['Buy', 'Sell'];
      let found = false;
      validStatus.forEach(function(thisStatus) {
        if(thisStatus===val) found = true;
      })
      return found;
    },
    arguments: ['Buy', 'Sell'],
    message: 'Side field in trade should either have {ARGS[0]} or {ARGS[1]}'
  })
];

var tradeStatusValidator = [
  validate({
    validator: function(val) {
      let validStatus = ["OPEN", "NOMINATED"];
      let found = false;
      validStatus.forEach(function(thisStatus) {
        if(thisStatus===val) found = true;
      })
      return found;
    },
    arguments: ["OPEN", "NOMINATED"],
    message: 'Trade status should be either {ARGS[0]} or {ARGS[1]}'
  })
];

var TradeSchema = new Schema({
  tradeId: Number,
  tradeDate: {type: Date, required: true, default: Date.now},
  commodity: {type: String, required: true, trim: true, minlength: 2},
  side: {type: String, required: true, trim: true, minlength: 3,
    validate: sideValidator},
  price: {type: Number, required: true},
  quantity: {type: Number, required: true},
  counterparty: {type: String, required: true, trim: true, minlength: 1},
  location: {type: String, required: true, trim: true, minlength: 3},
  status: {type: String, required: true, trim: true,
    minLength: 4, validate: tradeStatusValidator}
});

TradeSchema.pre('save', function(next) {
  var thisTrade = this;
  // get the Next sequence
  sequence.next(function(nextSeq) {
    thisTrade.tradeId = nextSeq;
    next();
  });
});

var Trade = mongoose.model(TRADE_MODEL_NAME, TradeSchema);

module.exports = {Trade, TradeSchema};
