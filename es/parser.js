import { BRACKET_LEFT, BRACKET_RIGHT, BRACE_LEFT, BRACE_RIGHT, COMMA, SYNTAX, COLON } from './constants';
import LazyJson from './lazy-json';

function parseArray(tokens, d = 1) {
  if (d <= 0) {
    for (let i = 0, depth = 0, len = tokens.length; i < len; i++) {
      const t = tokens[i];
      if (t === BRACKET_LEFT) {
        depth += 1;
      } else if (t === BRACKET_RIGHT) {
        depth -= 1;
      }

      if (depth < 0) {
        return [
          new LazyJson([BRACKET_LEFT, ...tokens.slice(0, i + 1), BRACKET_RIGHT]),
          tokens.slice(i + 1)
        ];
      }
    }

    throw 'Unexpected end of JSON input';
  }

  const arr = [];

  // empty array
  if (tokens[0] === BRACKET_RIGHT) {
    return [arr, tokens.slice(1)];
  }

  while (tokens.length) {
    const [json, tokens_] = parse(tokens, d - 1);

    if (SYNTAX.includes(json)) {
      throw `Unexpected token ${json} in JSON`;
    }

    arr.push(json);
    const t = tokens_[0];
    if (t === BRACKET_RIGHT) {
      return [arr, tokens_.slice(1)]
    } else if (t === COMMA) {
      tokens = tokens_.slice(1);
    } else {
      throw `Unexpected token ${t} in JSON`
    }
  }

  throw 'Unexpected end of JSON input';
}

function parseObject(tokens, d = 1) {
  if (d <= 0) {
    for (let i = 0, depth = 0, len = tokens.length; i < len; i++) {
      const t = tokens[i];
      if (t === BRACE_LEFT) {
        depth += 1;
      } else if (t === BRACE_RIGHT) {
        depth -= 1;
      }

      if (depth < 0) {
        return [
          new LazyJson([BRACE_LEFT, ...tokens.slice(0, i + 1), BRACE_RIGHT]),
          tokens.slice(i + 1)
        ];
      }
    }

    throw 'Unexpected end of JSON input';
  }

  const obj = {};

  // empty object
  if (tokens[0] === BRACE_RIGHT) {
    return [obj, tokens.slice(1)];
  }

  while (tokens.length) {
    const key = tokens[0];
    if (typeof key !== 'string') {
      throw `Unexpected token ${key} in JSON`;
    }

    if (tokens[1] !== COLON) {
      throw `Unexpected token ${tokens[1]} in JSON`;
    }

    const [json, tokens_] = parse(tokens.slice(2), d - 1);
    obj[key] = json;
    const t = tokens_[0];
    if (t === BRACE_RIGHT) {
      return [obj, tokens_.slice(1)];
    } else if (t === COMMA) {
      tokens = tokens.slice(1);
    } else {
      throw `Unexpected token ${t} in JSON`
    }
  }

  throw 'Unexpected end of JSON input';
}

function parse(tokens, d = 1) {
  const t = tokens[0];

  if (t === BRACKET_LEFT) {
    return parseArray(tokens.slice(1), d - 1);
  } else if (t === BRACE_LEFT) {
    return parseObject(tokens.slice(1), d - 1);
  } else {
    return [t, tokens.slice(1)]
  }
}

export default parse;
