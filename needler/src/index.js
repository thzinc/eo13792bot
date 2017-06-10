'use latest';
import Twitter from 'twitter';

const targetAccounts = [
    'RyanZinke',
    'RepRyanZinke',
    'SecretaryZinke',
    'Interior',
    'DOIDepSec',
    'DOIPressSec',
];

const salutations = [
    (screenName, message) => `Hey @${screenName}, ${message.text}${message.punctuation}`,
    (screenName, message) => `Dear @${screenName}, ${message.text}${message.punctuation}`,
    (screenName, message) => `@${screenName}, ${message.text}${message.punctuation}`,
    (screenName, message) => `${message.text.slice(0, 1).toUpperCase() + message.text.slice(1)}, @${screenName}${message.punctuation}`,
]

const messages = [
    {
        text: 'have you seen this public comment on the review of certain National Monuments',
        punctuation: '?'
    },
    {
        text: 'are you keeping up with all the comments on DOI-2017-0002',
        punctuation: '?'
    },
    {
        text: `don't forget to consider this`,
        punctuation: '.'
    },
    {
        text: `this person took time out of their day to talk to you about your review of National Monuments`,
        punctuation: '.'
    },
    {
        text: `what about this`,
        punctuation: '?'
    },
    {
        text: `please consider this comment`,
        punctuation: '.'
    },
];

const generateTweet = (url) => {
    const screenName = targetAccounts[Math.floor(Math.random() * targetAccounts.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const salutation = salutations[Math.floor(Math.random() * salutations.length)];
    return `${salutation(screenName, message)} ${url}`;
}

module.exports = (ctx, cb) => {
  const client = new Twitter({
    consumer_key: ctx.secrets.TWITTER_CONSUMER_KEY,
    consumer_secret: ctx.secrets.TWITTER_CONSUMER_SECRET,
    access_token_key: ctx.secrets.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: ctx.secrets.TWITTER_ACCESS_TOKEN_SECRET
  });
  
  const isDryRun = !!ctx.data.dryRun;

  const post = isDryRun ? x => x : client.post.bind(client, 'statuses/update');

  client.get('search/tweets', {
      q: `from:${ctx.secrets.TWITTER_SCREEN_NAME} #EO13792`,
    })
    // Get tweets from search results
    .then(results => results.statuses)
    // Select random tweet
    .then(tweets => tweets[Math.floor(Math.random() * tweets.length)])
    // Get tweet URL
    .then(tweet => `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)
    // Generate new tweet
    .then(status => ({ status: generateTweet(status) }))
    // Post new tweet
    .then(post)
    // Handle webhook callback
    .then(cb.bind(null, null))
    .catch(cb);
}

