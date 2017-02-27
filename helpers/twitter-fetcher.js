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
      if(process.env.QUERY_INTERVAL && process.env.QUERY_INTERVAL != 0){
        interval = process.env.QUERY_INTERVAL * 1000;
      }

      while(lastUpdate.isBefore(moment.utc())){
        var from = lastUpdate.format("YYYY-MM-DDTHH:mm:ss[Z]");
        var to = lastUpdate.add(interval, "milliseconds");

        if(to.isBefore(moment.utc())){
          lastUpdate = to.clone();
          timeRanges.push(from + "," + to.format("YYYY-MM-DDTHH:mm:ss[Z]"));
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
      setTimeout( function(){
        console.log("Historical fetch: " + i + " / " + timeRanges.length);
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

    response.on('end', function() {
      var res = JSON.parse(body);

      if(res.error){
        console.error(res);
        return;
      }

      var lastUpdate = ISODateString(new Date());
      cache.put("lastUpdate", lastUpdate);
      cache.put("latestTweets", res)

      var resultCount = res.search.results;
      console.log(timeQuery + " - " + resultCount + " results");

      cache.put("results", resultCount);

      persist(res.tweets);
    });
  }).on("error", function(e){
    console.error(e);
  });
}

//TODO replace all calls with this wrapper (but using moment.js)
function ISODateString(d) {
    function pad(n) {return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+'T'
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds())+'Z'
}


function persist(tweets){
  if(process.env.PERSIST){
    if(process.env.PERSIST.toUpperCase() === "CLOUDANT"){
      var cloudant = require('./cloudant');
      cloudant.insert(tweets);
    }

    if(process.env.PERSIST.toUpperCase() === "MONGODB"){
      var mongo = require('./mongodb');
      mongo.insert(tweets);
    }
  }
}
