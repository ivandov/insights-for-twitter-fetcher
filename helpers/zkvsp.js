var request = require('request')

var db = process.env.DB_NAME;
var zkvmpUri = "http://"   + process.env.ZKVSP_HOST + ":"
                        + process.env.ZKVSP_PORT + "/api/v1";

// var options = {contentType: 'application/json'}
var options = { followAllRedirects: true};


exports.insert = function(tweets) {
  insert(tweets);
}


function insert(tweets){
  console.log("persisting " + tweets.length + " tweets");

  for(var i=0; i < tweets.length; i++){
    var tweet = tweets[i];
    var tweetId = tweet.message.id; //id": "tag:search.twitter.com,2005:849986658816729088",

    var body = {
      Key: tweetId.split(":")[2],
      Value: tweet
    }

    var opts = options;
    opts.json = body;
    opts.url = zkvmpUri + "/buckets/" + db;
    opts.method = "POST";

    // console.log(opts);

    request(opts, function(err, res, body) {
      if(err) console.error(err)
      // if(body) console.log(body)
    });
  }


}
