'use latest';
import Twitter from 'twitter';
import getSingleComment from './tweetUtils';

module.exports = (ctx, cb) => {
  const docketId = 'DOI-2017-0002';
  const apiKey = ctx.secrets.REGULATIONS_GOV_API_KEY;
  const backlogCount = 500;

  // Set up Twitter API client
  const client = new Twitter({
    consumer_key: ctx.secrets.TWITTER_CONSUMER_KEY,
    consumer_secret: ctx.secrets.TWITTER_CONSUMER_SECRET,
    access_token_key: ctx.secrets.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: ctx.secrets.TWITTER_ACCESS_TOKEN_SECRET
  });

  // Get the context storage into `data`
  ctx.storage.get((error, data) => {
    const backlog = data || {};

    if (ctx.data.dump) {
      cb(null, backlog);
      return;
    }

    // Get a single comment to tweet
    getSingleComment(apiKey, docketId, backlogCount, backlog)
      // Then tweet it
      .then(document => {
        const status = `${document.tweet} ${document.targetUrl}`;
        return client.post('statuses/update', { status }).then(() => document);
      })
      // Then add the comment's hash to the context storage 
      .then(document => {
        backlog[document.hash] = true;
        backlog.lastError = null;
        // If something bad happened while saving to context storage, log it to STDERR and move on. No big deal.
        ctx.storage.set(backlog, console.error);
        return document;
      })
      // Then hit the Webtask's callback and end this request
      .then(cb.bind(null, null))
      // If anything went wrong with the above, handle it
      .catch(err => {
        console.error('error', err);
        if (err.type) {
          if (backlog.lastError !== err.type) {
            backlog.lastError = err.type;
            ctx.storage.set(backlog, console.error);
            switch (err.type) {
              case 'no-comments': {
                client.post('statuses/update', {
                  status: `There aren't any new comments to post right now. Maybe go leave a comment yourself: l.thzinc.com/doi20170002`
                })
                  .then(cb.bind(null, null))
                break;
              }
              case 'source-api-timeout': {
                client.post('statuses/update', {
                  status: `I can't get to the @RegulationsGov site right now, so comments will have to wait.`
                })
                  .then(cb.bind(null, null))
                break;
              }
              default: {
                console.error('Got an error type that was not handled');
                cb(null, 'Unhandled trivial error');
              }
            }
          } else {
            console.log(`Skipping ${err.type} because it was last handled`);
            cb(null, err);
          }
        } else {
          console.error('Not sure what to do with this error. Bailing out.');
          cb(err);
        }
      });
  })
}

