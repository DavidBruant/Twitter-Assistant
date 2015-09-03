// Type definitions for Natural 0.2.1
// Project: https://github.com/NaturalNode/natural
// Definitions by: Dylan R. E. Moonfire <https://github.com/dmoonfire/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

// *NOT* using <reference path="../node/node.d.ts"/>

declare module "natural" {
  //import events = require("events");

  class WordTokenizer {
    tokenize(text: string): string[];
  }
  class AggressiveTokenizer {
    tokenize(text: string): string[];
  }
  class TreebankWordTokenizer {
    tokenize(text: string): string[];
  }
  interface RegexTokenizerOptions {
    pattern: RegExp;
    discardEmpty?: boolean;
  }
  class RegexpTokenizer {
    constructor(options: RegexTokenizerOptions);
    tokenize(text: string): string[];
  }
  class WordPunctTokenizer {
    tokenize(text: string): string[];
  }

  function JaroWinklerDistance(s1: string, s2: string, dt?: number): number;
  function LevenshteinDistance(source: string, target: string, options?: any): number;
  function DiceCoefficient(str1: string, str2: string): number;

  interface Stemmer {
    stem(token: string): string;
  }
    
  var PorterStemmer: {
    stem(token: string): string;
  }
  var PorterStemmerRu: {
    stem(token: string): string;
  }
  var PorterStemmerEs: {
    stem(token: string): string;
  }
  var PorterStemmerFa: {
    stem(token: string): string;
  }
  var PorterStemmerFr: {
    stem(token: string): string;
  }
  var PorterStemmerIt: {
    stem(token: string): string;
  }
  var PorterStemmerNo: {
    stem(token: string): string;
  }
  var PorterStemmerPt: {
    stem(token: string): string;
  }

  interface BayesClassifierCallback { (err: any, classifier: any): void }
  class BayesClassifier {
    //events: events.EventEmitter;
    addDocument(text: string, stem: string): void;
    addDocument(text: string[], stem: string): void;
    train(): void;
    classify(observation: string): string;
    getClassifications(observation: string): string[];
    save(filename: string, callback: BayesClassifierCallback): void;
    static load(filename: string, stemmer: Stemmer, callback: BayesClassifierCallback): void;
    static restore(classifier: any, stemmer?: Stemmer): BayesClassifier;
  }

  var Metaphone: {
    compare(stringA: string, stringB: string): boolean;
    process(token: string, maxLength?: number): string;
  };
  var SoundEx: {
    compare(stringA: string, stringB: string): boolean;
    process(token: string, maxLength?: number): string;
  };
  var DoubleMetaphone: {
    compare(stringA: string, stringB: string): boolean;
    process(token: string, maxLength?: number): string[];
  };

  class NounInflector {
    pluralize(token: string): string;
    singularize(token: string): string;
  }
  var CountInflector: {
    nth(i: number): string;
  }
  class PresentVerbInflector {
    pluralize(token: string): string;
    singularize(token: string): string;
  }
  var NGrams: {
    bigrams(sequence: string, startSymbol?: string, endSymbol?: string): string[][];
    bigrams(sequence: string[], startSymbol?: string, endSymbol?: string): string[][];
    trigrams(sequence: string, startSymbol?: string, endSymbol?: string): string[][];
    trigrams(sequence: string[], startSymbol?: string, endSymbol?: string): string[][];
    ngrams(sequence: string, n: number, startSymbol?: string, endSymbol?: string): string[][];
    ngrams(sequence: string[], n: number, startSymbol?: string, endSymbol?: string): string[][];
  }
  var NGramsZH: {
    bigrams(sequence: string, startSymbol?: string, endSymbol?: string): string[][];
    bigrams(sequence: string[], startSymbol?: string, endSymbol?: string): string[][];
    trigrams(sequence: string, startSymbol?: string, endSymbol?: string): string[][];
    trigrams(sequence: string[], startSymbol?: string, endSymbol?: string): string[][];
    ngrams(sequence: string, n: number, startSymbol?: string, endSymbol?: string): string[][];
    ngrams(sequence: string[], n: number, startSymbol?: string, endSymbol?: string): string[][];
  }

  interface TfIdfCallback { (i: number, measure: number): void }
  interface TfIdfTerm {
    term: string;
    tfidf: number;
  }
  class TfIdf {
    constructor(deserialized?: any);
    addDocument(document: string, key?: string, restoreCache?: boolean): void;
    addDocument(document: string[], key?: string, restoreCache?: boolean): void;
    addFileSync(path: string, encoding?: string, key?: string, restoreCache?: boolean): void;
    tfidf(terms: string, d: number): void;
    tfidfs(terms: string, callback: TfIdfCallback): void;
    tfidfs(terms: string[], callback: TfIdfCallback): void;
    listTerms(d: number): TfIdfTerm[];
  }

  class Trie {
    constructor(caseSensitive?: boolean);
    addString(text: string): boolean;
    addStrings(strings: string[]): void;
    contains(token: string): boolean;
    findPrefix(text: string): string[];
    findMatchesOnPath(text: string): string[];
    keysWithPrefix(text: string): string[];
  }

  class EdgeWeightedDigraph {
    add(start: number, end: number, weight: number): void;
    v(): number;
    e(): number;
  }
  class ShortestPathTree {
    constructor(diagraph: EdgeWeightedDigraph, startVertex: number);
    getDistTo(vertex: number): number;
    hasDistTo(vertex: number): boolean;
    pathTo(vertex: number): number[];
  }
  class LongestPathTree {
    constructor(diagraph: EdgeWeightedDigraph, startVertex: number);
    getDistTo(vertex: number): number;
    hasDistTo(vertex: number): boolean;
    pathTo(vertex: number): number[];
  }

  interface WordNetLookupResults {
    synsetOffset: number;
    pos: string;
    lemma: string;
    synonyms: string[];
    gloss: string;
  }
  interface WordNetLookupCallback { (results: WordNetLookupResults[]): void }
  interface WordNetGetCallback { (results: WordNetLookupResults): void }
  class WordNet {
    constructor(filename?: string);
    lookup(word: string, callback: WordNetLookupCallback): void;
    get(synsetOffset: number, pos: string, callback: WordNetGetCallback): void;
  }

  class Spellcheck {
    constructor(wordlist: string[]);
    isCorrect(word: string): boolean;
    getCorrections(word: string, maxDistance?: number): string[];
  }
    
    var stopwords: string[];
}


// David Bruant's additions :

declare module 'natural/lib/natural/util/stopwords_fr.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_es.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_ja.js' {
    var words: String[];
    export = words;
}
declare module 'natural/lib/natural/util/stopwords_it.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_ru.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_pt.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_nl.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_no.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_fa.js' {
    var words: String[];
}
declare module 'natural/lib/natural/util/stopwords_pl.js' {
    var words: String[];
}


declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_fr.js' {
    class TokenizerFrStatic {
        new(): TokenizerFr;
        tokenize(str: string) : string[]
    }
    class TokenizerFr{}
    
    export = TokenizerFrStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_es.js' {
    class TokenizerEsStatic {
        new(): TokenizerEs;
        tokenize(str: string) : string[]
    }
    class TokenizerEs{}
    
    export = TokenizerEsStatic;
}
declare module 'natural/lib/natural/tokenizers/tokenizer_ja.js' {
    class TokenizerJaStatic {
        new(): TokenizerJa;
        tokenize(str: string) : string[]
    }
    class TokenizerJa{}
    
    export = TokenizerJaStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_it.js' {
    class TokenizerItStatic {
        new(): TokenizerIt;
        tokenize(str: string) : string[]
    }
    class TokenizerIt{}
    
    export = TokenizerItStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_ru.js' {
    class TokenizerRuStatic {
        new(): TokenizerRu;
        tokenize(str: string) : string[]
    }
    class TokenizerRu{}
    
    export = TokenizerRuStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_pt.js' {
    class TokenizerPtStatic {
        new(): TokenizerPt;
        tokenize(str: string) : string[]
    }
    class TokenizerPt{}
    
    export = TokenizerPtStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_nl.js' {
    class TokenizerNlStatic {
        new(): TokenizerNl;
        tokenize(str: string) : string[]
    }
    class TokenizerNl{}
    
    export = TokenizerNlStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_no.js' {
    class TokenizerNoStatic {
        new(): TokenizerNo;
        tokenize(str: string) : string[]
    }
    class TokenizerNo{}
    
    export = TokenizerNoStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_fa.js' {
    class TokenizerFaStatic {
        new(): TokenizerFa;
        tokenize(str: string) : string[]
    }
    class TokenizerFa{}
    
    export = TokenizerFaStatic;
}
declare module 'natural/lib/natural/tokenizers/aggressive_tokenizer_pl.js' {
    class TokenizerPlStatic {
        new(): TokenizerPl;
        tokenize(str: string) : string[]
    }
    class TokenizerPl{}
    
    export = TokenizerPlStatic;
}


    
declare module 'natural/lib/natural/stemmers/stemmer_ja.js'{
    class StemmerJa{
        stem(token: string): string
    }
    
    export = StemmerJa;
}    
declare module 'natural/lib/natural/stemmers/stemmer_pl.js'{
    function stem(str: string): string
    
    export = stem;
}  
declare module 'natural/lib/natural/stemmers/porter_stemmer_pt.js'{
    function stem(str: string): string
    
    export = {stem: stem};
}    
    
    