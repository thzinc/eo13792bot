'use latest';
import sentiment from 'sentiment';
import Tokenizer from 'sentence-tokenizer';
import md5 from 'md5';

export default (commentText) => {
  const tokenizer = new Tokenizer('unused', 'unused');
  tokenizer.setEntry(commentText);

  const pullQuote = tokenizer.getSentences()
    .map(sentence => ({
      sentence,
      score: sentiment(sentence).score,
    }))
    .reduce((min, curr) => {
      const last = min || curr;
      return last.score < curr.score
        ? last
        : (
          last.sentence.length < curr.sentence.length ? curr : last
        );
    });

  const hash = md5(tokenizer.getTokens().join(' '));

  return {
    pullQuote,
    hash,
  };
};
