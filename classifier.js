'use latest';
import fetch from 'node-fetch';
import sentiment from 'sentiment';
import Tokenizer from 'sentence-tokenizer';
const baseUrl = 'https://api.data.gov/regulations/v3';

const formatTweet = (pullQuote) => `${pullQuote} #EO13792`;

module.exports = (ctx, cb) => {
  const docketId = 'DOI-2017-0002';
  const apiKey = ctx.secrets.REGULATIONS_GOV_API_KEY;
  fetch(`${baseUrl}/documents.json?api_key=${apiKey}&dktid=${docketId}&dct=PS&sb=postedDate&so=DESC&rpp=1000`)
    .then(response => response.json())
    .then(page => page.documents)
    .then(documents => documents
      .map(document => {
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
        
        return {
          documentId: document.documentId,
          commentText: document.commentText,
          pullQuote: mostNegative.sentence,
          score: mostNegative.score,
        };
      })
      .map(x => ({
        
      })))
    .then(cb.bind(null, null));
}

