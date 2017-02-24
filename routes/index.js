var express = require('express');
var router = express.Router();
var cache = require('persistent-cache');

cache = cache({base: './'});

/* GET home page. */
router.get('/', function(req, res, next) {

  cache.get("lastUpdate", function(err, lastUpdate){
    res.render('index',
    { title: 'Express',
      lastUpdate: lastUpdate
    });
  });

});

module.exports = router;
