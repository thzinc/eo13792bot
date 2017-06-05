'use latest';
import fetch from 'node-fetch';
import sentiment from 'sentiment';
import Tokenizer from 'sentence-tokenizer';
import md5 from 'md5';
import Twitter from 'twitter';
const baseUrl = 'https://api.data.gov/regulations/v3';



const formatTweet = (pullQuote) => `${pullQuote} #EO13792`;

const mapDocument = (document) => {
  const tokenizer = new Tokenizer(document.documentId, document.documentId);
  tokenizer.setEntry(document.commentText);
  const mostNegative = tokenizer.getSentences()
    .map(sentence => ({
      sentence,
      score: sentiment(sentence).score,
    }))
    .reduce((min, sentence) => {
      const last = min || sentence;
      return last.score < sentence.score ? last : sentence;
    });
  const hash = md5(tokenizer.getTokens().join(' '));
  return {
    documentId: document.documentId,
    commentText: document.commentText,
    pullQuote: mostNegative.sentence,
    score: mostNegative.score,
    hash,
  };
};

const getDocuments = (apiKey, docketId, backlogCount) => {
  return fetch(`${baseUrl}/documents.json?api_key=${apiKey}&dktid=${docketId}&dct=PS&sb=postedDate&so=DESC&rpp=${backlogCount}`)
    .then(response => response.json())
    .then(page => page.documents)
    .then(documents => documents
      .map(mapDocument)
      .map(x => ({
        documentId: x.documentId,
        commentText: x.commentText,
        tweet: formatTweet(x.pullQuote),
        score: x.score,
        hash: x.hash,
      })));
}

module.exports = (ctx, cb) => {
  const docketId = 'DOI-2017-0002';
  const apiKey = ctx.secrets.REGULATIONS_GOV_API_KEY;
  const backlogCount = 100;

  const client = new Twitter({
    consumer_key: ctx.secrets.TWITTER_CONSUMER_KEY,
    consumer_secret: ctx.secrets.TWITTER_CONSUMER_SECRET,
    access_token_key: ctx.secrets.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: ctx.secrets.TWITTER_ACCESS_TOKEN_SECRET
  });

  ctx.storage.get((error, data) => {
    const backlog = data || {};

    getDocuments(apiKey, docketId, backlogCount)
      .then(documents => documents.reduce((o, d) => {
        o[d.hash] = o[d.hash] || d;
        return o;
      }, {}))
      .then(obj => Object.keys(obj)
        .map(k => obj[k])
        .filter(document => !backlog[document.hash])
        .filter(document => document.tweet.length < 120)
        .reduce((l, curr) => {
          const last = l || curr;
          return last.score < curr.score ? last : curr;
        }))
      .then(document => {
        backlog[document.hash] = true;
        ctx.storage.set(backlog, console.log);
        client.post('statuses/update', {
          status: `${document.tweet} https://www.regulations.gov/document?D=${document.documentId}`,
        }, cb);
      });
  })
}

