'use latest';
import Twitter from 'twitter';
import getSingleComment from './tweetUtils';

module.exports = (ctx, cb) => {
  const docketId = 'DOI-2017-0002';
  const apiKey = ctx.secrets.REGULATIONS_GOV_API_KEY;
  const backlogCount = 250;

  const client = new Twitter({
    consumer_key: ctx.secrets.TWITTER_CONSUMER_KEY,
    consumer_secret: ctx.secrets.TWITTER_CONSUMER_SECRET,
    access_token_key: ctx.secrets.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: ctx.secrets.TWITTER_ACCESS_TOKEN_SECRET
  });

  ctx.storage.get((error, data) => {
    const backlog = data || {};

    getSingleComment(apiKey, docketId, backlogCount, backlog)
      .then(document => {
        backlog[document.hash] = true;
        ctx.storage.set(backlog, console.log);
        client.post('statuses/update', {
          status: `${document.tweet} ${document.targetUrl}`,
        }, cb);
      })
      .catch(err => {
        console.error('error', err);
        cb(err);
      });
  })
}

