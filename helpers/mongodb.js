var MongoClient = require('mongodb').MongoClient


var db;
mongoURI = "mongodb://" + process.env.MONGODB_HOST + ":"
                        + process.env.MONGODB_PORT + "/"
                        + process.env.DB_NAME


exports.insert = function(tweets) {
  if(db === undefined || db === null){
    initDB(function(){
      insert(tweets);
    });
  }
  else{
    insert(tweets);
  }
}

function initDB(next){

  console.log("Connecting to " + mongoURI);
  // Use connect method to connect to the server
  MongoClient.connect(mongoURI, function(err, dbResp) {
    if(err) console.error(err);

    console.log("MongoDB Connected successfully to " + process.env.DB_NAME);
    db = dbResp;

    next();
  });
}

function insert(tweets){
  // Get the tweets collection
  var collection = db.collection('tweets');
  // Insert some tweets
  collection.insertMany(tweets, function(err, result) {
    if(err) console.error(err);
    else console.log("Inserted " + result.result.n + " tweets");
  });
}
