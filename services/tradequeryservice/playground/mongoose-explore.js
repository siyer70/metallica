var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/test", {useMongoClient:true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Hurray! - we are connected');
});
