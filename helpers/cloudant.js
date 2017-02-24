var Cloudant = require('cloudant');

// var cloudantCreds = {
//   hostname: process.env.CLOUDANT_HOST + ":8080",
//   username: process.env.CLOUDANT_USER,
//   password: process.env.CLOUDANT_PASS
// }
// console.log(cloudantCreds);

//global db reference
var db;

var cloudantURI = "http://" + process.env.CLOUDANT_USER + ":"
                            + process.env.CLOUDANT_PASS + "@"
                            + process.env.CLOUDANT_HOST + ":"
                            + process.env.CLOUDANT_PORT;



var cloudant = Cloudant(cloudantURI, function(err, cloudant, reply) {
  if (err) throw err;
  console.log('Connected with username: %s', reply.userCtx.name);

  cloudant.db.get(process.env.DB_NAME, function(err, body) {
    if(err){
      cloudant.db.create(process.env.DB_NAME, function(err){
        db = cloudant.db.use(process.env.DB_NAME);
      });
    }
    else{
      db = cloudant.db.use(process.env.DB_NAME);
    }
  });
});



exports.insert = function(tweets){
  db.bulk({docs:tweets}, function(err){
    if(err) throw err;

    console.log("inserted tweets");
  });
}
