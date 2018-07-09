import { QUOTE, SYNTAX } from './constants';

const createToken = (type, value) => ({ type, value });

const tokenizers = [];

tokenizers.push(function string(string) {
  if (string[0] !== QUOTE) return [null, string];

  string = string.slice(1);
  const endPosition = string.indexOf(QUOTE);
  if (endPosition === -1) {
    throw 'Unexpected end of JSON input'
  }
  return [
    createToken('string', string.slice(0, endPosition)),
    string.slice(endPosition + 1)
  ];
});

tokenizers.push(function number(string) {
  const matches = string.match(/^[\d\.\-e]+/);

  if (matches == null) return [null, string];

  const rest = string.slice(matches[0].length);
  const num = Number(matches[0]);
  return [
    createToken('number', num),
    rest
  ];
});

tokenizers.push(function bool(string) {
  if (string.startsWith('true')) {
    return [
      createToken('bool', true),
      string.slice(4)
    ];
  } else if (string.startsWith('false')) {
    return [
      createToken('bool', false),
      string.slice(5)
    ]
  }
  return [null, string];
});

tokenizers.push(function nil(string) {
  if (string.startsWith('null')) {
    return [
      createToken('nil', null),
      string.slice(4)
    ];
  }
  return [null, string];
});

tokenizers.push(function syntax(string) {
  const ch = string[0];
  if (SYNTAX.includes(ch)) {
    return [
      createToken('syntax', ch),
      string.slice(1)
    ];
  }
  return [null, string];
});

function lex(string) {
  const tokens = [];
  string = string.trim();

  while(string.length) {
    let tok, string_, synerr = true;
    for (const tokenizer of tokenizers) {
      [tok, string_] = tokenizer(string);
      if (tok != null) {
        synerr = false;
        break;
      }
    }

    if (synerr) {
      throw `Unexpected token ${string[0]} in JSON`;
    } else {
      tokens.push(tok.value);
      string = string_.trim();
    }
  }

  return tokens;
}

export default lex;
