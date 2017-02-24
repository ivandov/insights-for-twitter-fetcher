var express = require('express');
var router = express.Router();
var https = require('https');
var cache = require('persistent-cache')

cache = cache({base: './'});

/* GET users listing. */
router.get('/', function(req, res, next) {
  cache.get("latestTweets", function(err, tweets){
    if(err){
      res.send(err);
    }
    else{
      res.json(tweets);
    }
  });
});

module.exports = router;
