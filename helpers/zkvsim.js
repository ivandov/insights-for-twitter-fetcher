var request = require('request')

var db;
zkvmisUri = "http://"   + process.env.ZKVSIM_HOST + ":"
                        + process.env.ZKVSIM_PORT + "/api/v1";

// var options = {contentType: 'application/json'}
var options = { followAllRedirects: true};


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
  var dbname = process.env.DB_NAME;
  console.log("Initing KVSIM bucket: " + dbname);

  var opts = options;
  opts.json = { "name": dbname }
  opts.url = zkvmisUri + "/buckets"
  opts.method = "POST";

  // console.log(opts)

  request(opts, function(err, res, body) {
    if(err) console.error(err);

    if(res && (res.statusCode == 200 || res.statusCode == 500)){
      db = dbname;
      next();
    }
    else{
      console.error("Unexpected response from KVSIM")
      console.error(err);
      console.error(body);
    }
  });
}


function insert(tweets){
  console.log("persisting " + tweets.length + " tweets");

  var opts = options;
  opts.json = true;

  for(var i=0; i < tweets.length; i++){
    var tweet = tweets[i];
    var tweetId = tweet.message.id; //id": "tag:search.twitter.com,2005:849986658816729088",

    var opts = options;
    opts.json = tweet;
    opts.url = zkvmisUri + "/buckets/" + db + "/" + tweetId.split(":")[2];
    opts.method = "PUT";

    request(opts, function(err, res, body) {
      if(err) console.error(err)
      // console.log("tweet " + tweetId + " stored");
    });
  }


}
