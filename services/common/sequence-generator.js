var mongoose = require('mongoose');

// Create a sequence
function sequenceGenerator(name) {
  var SequenceSchema, Sequence;

  SequenceSchema = new mongoose.Schema({
    nextSeqNumber: { type: Number, default: 1 }
  });

  Sequence = mongoose.model(name + 'Seq', SequenceSchema);

  return {
    next: function(callback){
      Sequence.find(function(err, data){
        if(err){ throw(err); }

        if(data.length < 1){
          // create if doesn't exist create and return first
          Sequence.create({}, function(err, seq){
            if(err) { throw(err); }
            Sequence.find(function(myerr, mydata) {
              if(myerr) {throw(myerr);}
              // if it is still not found, then report
              if(mydata.length < 1) {
                console.log("error - could not find the seq record - sequence generated will not correct");
              }
              callback(seq.nextSeqNumber);
            });
          });
        } else {
          // update sequence and return next
          Sequence.findByIdAndUpdate(data[0]._id, { $inc: { nextSeqNumber: 1 } }, {new:true}, function(err, seq){
            if(err) { throw(err); }
            callback(seq.nextSeqNumber);
          });
        }
      });
    }
  };
}


module.exports = sequenceGenerator;
