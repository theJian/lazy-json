import parse_ from './parser';
import lex from './lexer';
import LazyJson from './lazy-json';

export function parse(stringOrLazyJson) {
  if (stringOrLazyJson instanceof LazyJson) {
    return parse_(stringOrLazyJson.getTokens());
  }
  const string = stringOrLazyJson + ''; // convert to string
  const tokens = lex(string);
  return parse_(tokens);
}

export function isLazyJson(lazyJson) {
  return (lazyJson instanceof LazyJson);
}
