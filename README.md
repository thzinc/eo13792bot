# EO 13792 Bot

"I'm a bot that quotes from public comments to Ryan Zinke because of Executive Order 13792. Tell him something at http://l.thzinc.com/doi20170002"

This repo represents two [Auth0 Webtasks](https://webtask.io) that run on a schedule: the quoter and the needler.

## Quoter

The Quoter pulls recent public submissions from Regulations.gov on docket [DOI-2017-0002](https://www.regulations.gov/document?D=DOI-2017-0002-0001) ("Review of Certain National Monuments Established Since 1996; Notice of Opportunity for Public Comment"). It does some very simple sentiment analysis on the text of the comments to find the most "negative" sentence within the comment and use that as the quote to tweet. It also uses a basic MD5 hash as a key to filter out comments that have been previously tweeted.

### Example tweet

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Once these lands are gone, there is no bringing them back or replacement. <a href="https://twitter.com/hashtag/EO13792?src=hash">#EO13792</a> <a href="https://t.co/4NaHP8DdvP">https://t.co/4NaHP8DdvP</a></p>&mdash; EO 13792 Bot (@EO13792Bot) <a href="https://twitter.com/EO13792Bot/status/872992092640862208">June 9, 2017</a></blockquote>

## Needler

The Needler pulls tweets by the Quoter and retweets them with a randomly-chosen madlib-style tweet to one of several Department of Interior or Ryan Zinke Twitter accounts.

### Example tweet

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Hey <a href="https://twitter.com/DOIPressSec">@DOIPressSec</a>, this person took time out of their day to talk to you about your review of National Monuments. <a href="https://t.co/55EOErqLBM">https://t.co/55EOErqLBM</a></p>&mdash; EO 13792 Bot (@EO13792Bot) <a href="https://twitter.com/EO13792Bot/status/873010079288541184">June 9, 2017</a></blockquote>

## Contributing

Each of the Webtasks are implemented as separate npm modules. 

### Set up

* Sign up for [Auth0 Webtasks](https://webtask.io/make)
* Grab the Webtask CLI: `npm install wt-cli -g`
* Init the Webtask CLI: `wt init`
* Create a [Twitter app](https://apps.twitter.com)
* Sign up for a [Data.gov API key](https://api.data.gov/signup/)
* Copy `.secrets-template` file to `.secrets` and fill it in with your data from above

#### `.secrets` variables

* `REGULATIONS_GOV_API_KEY`
    * Data.gov API key
* `TWITTER_CONSUMER_KEY`
    * Twitter app consumer key
* `TWITTER_CONSUMER_SECRET`
    * Twitter app consumer secret
* `TWITTER_ACCESS_TOKEN_KEY`
    * Twitter access token key
* `TWITTER_ACCESS_TOKEN_SECRET`
    * Twitter access token secret
* `TWITTER_SCREEN_NAME`
    * Twitter screen name associated to the access token

### Development workflow

* Change directory to the Webtask you wish to work on
* `npm install` to install dependencies
* `npm run start` to publish the Webtask and watch for file changes
    * The URL to the webhook will be printed to the console

When you are done with development, schedule the Webtask to run regularly with `npm run publish`.