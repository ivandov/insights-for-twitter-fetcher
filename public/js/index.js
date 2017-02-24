$(function(){
  getTweets();
});

function getTweets(){
  $.getJSON("/tweets", function(data){

    var tweets = [];
    $.each(data.tweets, function(i, tweet){
      tweets.push(tweet);
    });

    displayTweets(tweets);
  });
}

function displayTweets(tweets){
  var $template = $(".template");

  $.each(tweets, function(i, tweet){
      var $newCard = $template.clone();
      var id = "tweet_" + i;
      $newCard.find("[data-toggle]").attr("href", "#"+id).text(tweet.message.body);
      $newCard.find("[role='tabpanel']").attr("id", id);
      $newCard.find(".card-block").html("<pre><code class='json'>" + JSON.stringify(tweet, null, 2) + "</code></pre>");
      $("#tweets").append($newCard.fadeIn());
  });

  //highlight all the JSON code
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}
