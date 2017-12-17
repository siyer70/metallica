const mongoose = require('mongoose');
const config = require('./../../common/config');
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_TRADES_URI, {useMongoClient:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB!');
});

module.exports = {mongoose};
