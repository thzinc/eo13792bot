'use latest';
import sentiment from 'sentiment';
import Tokenizer from 'sentence-tokenizer';
import md5 from 'md5';

export default (commentText) => {
  // The Tokenizer has a notion of words describing itself. Not used here.
  const tokenizer = new Tokenizer('unused', 'unused');
  tokenizer.setEntry(commentText);

  const pullQuote = tokenizer.getSentences()
    // Score each sentence
    .map(sentence => ({
      sentence,
      score: sentiment(sentence).score,
    }))
    // Select a single sentence with the most negative score and the longest character length
    .reduce((min, curr) => {
      const last = min || curr;
      return last.score < curr.score
        ? last
        : (
          last.sentence.length < curr.sentence.length ? curr : last
        );
    });
  
  // Hash the comment for duplication checks
  const hash = md5(tokenizer.getTokens().join(' '));

  return {
    pullQuote,
    hash,
  };
};
