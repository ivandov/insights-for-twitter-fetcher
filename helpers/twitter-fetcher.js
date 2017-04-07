require('dotenv').config();
var https = require('https');
var cache = require('persistent-cache');
var moment = require('moment');

cache = cache({base: './', memory: false});

var apiUri =  "https://" + process.env.INSIGHTS_TWITTER_USERNAME + ":" + process.env.INSIGHTS_TWITTER_PASSWORD +
              "@cdeservice.mybluemix.net/api/v1/messages/";


//Start the fetching process, updates will be avialable in the cache (cache.get("latestTweets"))
exports.fetch = function fetch(){
  try {
    query = process.env.QUERY;
    console.log("Found QUERY set in .env");
  } catch (e) {
    console.log("QUERY not set as environment variable, unable to execute pull");
    console.log(e);
    return;
  }

  getTweets(query);
}

//Performs a search query with the given size
function getTweets(query){
  cache.get('lastUpdate', function(err, lastUpdate){
    var timeRanges = []

    if(err || lastUpdate === undefined){
      var daysBack = 1;
      if (process.env.QUERY_HISTORY) daysBack = process.env.QUERY_HISTORY;

      //set the date to a day ago to not pull too many tweets
      var lastUpdate = moment.utc().subtract(daysBack, "days");
      // var lastUpdate = new Date(new Date().setDate(new Date().getDate()-daysBack));
      // lastUpdate = ISODateString(lastUpdate);

      console.log("lastUpdate not found in cache, setting query date to " + lastUpdate);

      //figure out how many loops we need to do with the current INTERVAL setting
      var interval = 1000 * 60 * 5;
      if(process.env.QUERY_INTERVAL){
        if(process.env.QUERY_INTERVAL == 0){
          interval = 1000 * 60 * 60 * 24 * daysBack
        }
        else{
          interval = process.env.QUERY_INTERVAL * 1000;
        }
      }

      while(lastUpdate.isBefore(moment.utc())){
        var from = formatDate(lastUpdate);
        var to = lastUpdate.add(interval, "milliseconds");

        if(to.isBefore(moment.utc())){
          lastUpdate = to.clone();
          timeRanges.push(from + "," + formatDate(to));
        }
      }

      console.log("Fetching " + timeRanges.length + " historical time ranges");
    }
    else{
      timeRanges.push(lastUpdate);
    }

    timeRanges.forEach(function(timeRange, i){
      //FIXME make this more elegant
      var delayBetweenCalls = 1000; // 1 second
      if(process.env.QUERY_HISTORY_API_DELAY) delayBetweenCalls = process.env.QUERY_HISTORY_API_DELAY;

      setTimeout( function(){
        console.log("Fetching: " + (i+1) + " / " + timeRanges.length);
        getResults(timeRange, query);
      }, delayBetweenCalls * i);
    });
  });
}


function getResults(timeRange, query){
  var timeQuery = "(" + query + ")" + " AND posted:" + timeRange;

  var searchURI = apiUri + "search?size=500&q="+timeQuery
  searchURI = encodeURI(searchURI);

  console.log("GET " + searchURI);
  https.get(searchURI, function(response) {
    var body = "";

    response.on('data', function(data) {
      body += data;
    });

    //TODO rewrite using request module, handle 500 server error
    response.on('end', function() {
      var res;

      try {
        res = JSON.parse(body);
      } catch(e) {
        console.error(e); // error in the above string (in this case, yes)!
        return;
      }

      if(res.error){
        console.error(res);
        return;
      }

      var lastUpdate = formatDate(moment.utc());
      cache.putSync("lastUpdate", lastUpdate);
      cache.putSync("latestTweets", res)

      var resultCount = res.search.results;
      console.log(timeQuery + " - " + resultCount + " results");

      cache.putSync("results", resultCount);

      persist(res.tweets);
    });
  }).on("error", function(e){
    console.error(e);
  });
}


function formatDate(moment) {
    return moment.format("YYYY-MM-DDTHH:mm:ss[Z]");
}


function persist(tweets){
  if(tweets.length == 0) return;

  if(process.env.PERSIST){
    if(process.env.PERSIST.toUpperCase() === "CLOUDANT"){
      var cloudant = require('./cloudant');
      cloudant.insert(tweets);
    }

    if(process.env.PERSIST.toUpperCase() === "MONGODB"){
      var mongo = require('./mongodb');
      mongo.insert(tweets);
    }

    if(process.env.PERSIST.toUpperCase() === "ZKVSIM"){
      var zkvsim = require('./zkvsim');
      zkvsim.insert(tweets);
    }

    if(process.env.PERSIST.toUpperCase() === "ZKVSP"){
      var zkvsim = require('./zkvsp');
      zkvsim.insert(tweets);
    }
  }
}
