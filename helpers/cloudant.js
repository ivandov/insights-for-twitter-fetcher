var Cloudant = require('cloudant');

// var cloudantCreds = {
//   hostname: process.env.CLOUDANT_HOST + ":8080",
//   username: process.env.CLOUDANT_USER,
//   password: process.env.CLOUDANT_PASS
// }
// console.log(cloudantCreds);

//global db reference
var db;
var cloudantURI;

if(process.env.CLOUDANT_URL){
  cloudantURI = process.env.CLOUDANT_URL;
}
else{
  cloudantURI = "http://" + process.env.CLOUDANT_USER + ":"
                          + process.env.CLOUDANT_PASS + "@"
                          + process.env.CLOUDANT_HOST + ":"
                          + process.env.CLOUDANT_PORT;
}

var cloudant = Cloudant(cloudantURI, function(err, cloudant, reply) {
  if (err) throw err;
  console.log('Connected with username: %s', reply.userCtx.name);
});


/**
 Wrapper around internal insert function, makes sure db is initialized first
**/
exports.insert = function(tweets){
  //FIXME clean this up
  if(db === undefined){
    initDB(function(){
      insert(tweets);
    });
  }
  else{
    insert(tweets);
  }
}

function initDB(next){
  cloudant.db.get(process.env.DB_NAME, function(err, body) {
    if(err){
      cloudant.db.create(process.env.DB_NAME, function(err){
        db = cloudant.db.use(process.env.DB_NAME);
        next();
      });
    }
    else{
      db = cloudant.db.use(process.env.DB_NAME);
      next();
    }
  });
}

function insert(tweets){
  console.log("persisting " + tweets.length + " tweets");
  while(tweets.length > 0) {
    var chunk = tweets.splice(0,50);

    db.bulk({docs: chunk}, function(err){
      if(err){
        console.error(err);
      }
    });
  }

}
