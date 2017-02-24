Insights for Twitter Fetcher
===============

The Insights for Twitter Fetcher is a small wrapper around the [Insights for Twitter](https://console.ng.bluemix.net/docs/services/Twitter/index.html)
Bluemix service.

The fetcher automatically starts a fetch based on settings in `.env` and keeps a local cache of the latest results. Results are only fetched based on new tweets since your last run. On the first run, tweets are pulled starting from the previous day.


### Pre-Reqs
Modify and save the `template.env` file with as `.env` and include the following minimum Environment Variable requirements:
 - `INSIGHTS_TWITTER_USERNAME=generated-uuid`
 - `INSIGHTS_TWITTER_PASSWORD=generated-pass`
 - `QUERY="IBM lang:en"`

The username and password are generated when creating a new service on Bluemix. The `QUERY` string is set based on the REST API [Query Language](https://console.ng.bluemix.net/docs/services/Twitter/twitter_rest_apis.html#querylanguage).

### Optional settings
 - Use the `QUERY_INTERVAL` setting to specify how often this fetch should be run
  - Values should be in seconds, default is 5 minutes.
  - `QUERY_INTERVAL=2` - fetches every 2 seconds
  - `QUERY_INTERVAL=0` - disables automatic interval fetching


### Work Items
 - Persist the current fetch into a DB such as MongoDB or Cloudant
 - Set env variable for how far back to go on first query
 - Keep local cache longer than latest pull
 - Create Dockerfile for portability
