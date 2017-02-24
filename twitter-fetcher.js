require('dotenv').config();
var https = require('https');
var cache = require('persistent-cache');


cache = cache();

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

    if(err || lastUpdate === undefined){
      //set the date to a day ago to not pull too many tweets
      var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
      lastUpdate = ISODateString(yesterday);

      console.log("lastUpdate not found in cache, setting query date to " + yesterday);
    }

    query = "(" + query + ")" + " AND posted:" + lastUpdate;
    console.log("Query: " + query);

    var searchURI = apiUri + "search?q="+query
    searchURI = encodeURI(searchURI);

    https.get(searchURI, function(response) {

      var body = "";

      response.on('data', function(data) {
        body += data;
      });

      response.on('end', function() {
        var lastUpdate = ISODateString(new Date());
        cache.put("lastUpdate", lastUpdate);
        cache.put("latestTweets", JSON.parse(body))

        var resultCount = JSON.parse(body).search.results;
        console.log("Result Count: " + resultCount);

        cache.put("results", resultCount);
      });
    });
  });
}


function ISODateString(d) {
    function pad(n) {return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
         + pad(d.getUTCMonth()+1)+'-'
         + pad(d.getUTCDate())+'T'
         + pad(d.getUTCHours())+':'
         + pad(d.getUTCMinutes())+':'
         + pad(d.getUTCSeconds())+'Z'
}
