'use latest';
import getRecentComments from './regulations-gov-api';
import analyze from './analyzer';

const maxTweetLength = 140;
const shortUrlLength = 23;
const tweetLength = maxTweetLength - shortUrlLength - 1;

const formatTweet = (pullQuote) => `${pullQuote} #EO13792`;

const mapDocument = (document) => {
  const analysis = analyze(document.commentText);

  return {
    documentId: document.documentId,
    commentText: document.commentText,
    tweet: formatTweet(analysis.pullQuote.sentence),
    targetUrl: `https://www.regulations.gov/document?D=${document.documentId}`,
    score: analysis.pullQuote.score,
    hash: analysis.hash,
  };
};

const getDocuments = (apiKey, docketId, backlogCount) => {
  return getRecentComments(apiKey, docketId, backlogCount)
    .then(documents => documents.map(mapDocument));
}

export default (apiKey, docketId, backlogCount, excludedHashes) =>
  getDocuments(apiKey, docketId, backlogCount)
    .then(documents => documents.reduce((o, d) => {
      o[d.hash] = o[d.hash] || d;
      return o;
    }, {}))
    .then(obj => Object.keys(obj)
      .map(k => obj[k])
      .filter(document => !excludedHashes[document.hash])
      .filter(document => document.tweet.length < tweetLength))
    .then(documents => documents.length ? documents : Promise.reject({
      type: 'no-comments',
    }))
    .then(documents => documents.reduce((l, curr) => {
      const last = l || curr;
      return last.score < curr.score
        ? last
        : (last.tweet.length < curr.tweet.length ? curr : last);
    }))
