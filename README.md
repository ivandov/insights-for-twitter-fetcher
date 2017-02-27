Insights for Twitter Fetcher
===============

The Insights for Twitter Fetcher is a small wrapper around the [Insights for Twitter](https://console.ng.bluemix.net/docs/services/Twitter/index.html)
Bluemix service.

The fetcher automatically starts a fetch based on settings in `.env` and keeps a local cache of the latest results. Results are only fetched based on new tweets since your last run. On the first run, tweets are pulled starting from the previous day.


### Pre-Reqs
Modify and save the `template.env` file as `.env` and include the following minimum environment variable requirements:
 - `INSIGHTS_TWITTER_USERNAME=generated-uuid`
 - `INSIGHTS_TWITTER_PASSWORD=generated-pass`
 - `QUERY="IBM lang:en"`

The username and password are generated when creating a new service on Bluemix. The `QUERY` string is set based on the REST API [Query Language](https://console.ng.bluemix.net/docs/services/Twitter/twitter_rest_apis.html#querylanguage).


### Persisting to DB
If local cache storage is insufficient, you can choose to persist the fetched tweets into a database. Currently the only supported DB is Cloudant, but MongoDB should be added soon. To write to a DB, the following additional environment variables are required:
 - `PERSIST=CLOUDANT`
 - `DB_NAME=something_related_to_query` - A name that corresponds to the query this fetcher is running
 - `CLOUDANT_HOST=127.0.0.1` - IP of your Cloudant host
 - `CLOUDANT_PORT=8080` - the port which your Cloudant service listens on
 - `CLOUDANT_USER=user`
 - `CLOUDANT_PASS=pass`

### Optional settings
 - Use the `QUERY_INTERVAL` setting to specify how often this fetch should be run
  - Values should be in seconds, default is 5 minutes.
  - `QUERY_INTERVAL=2` - fetches every 2 seconds
  - `QUERY_INTERVAL=0` - disables automatic interval fetching
 - Use the `QUERY_HISTORY` setting to specify how many days back the fetch should go
  - `QUERY_HISTORY=30` - fetches starting 30 days back


### Work Items
 - Persist the current fetch into a DB such as MongoDB or Cloudant (WIP)
 - Set env variable for how far back to go on first query
 - Keep local cache longer than latest pull
 - Create Dockerfile for portability
