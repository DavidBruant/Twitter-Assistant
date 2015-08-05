/// <reference path="../../defs/natural.d.ts" />

"use strict";

import natural = require('natural');
import stopwordsFrModule = require('natural/lib/natural/util/stopwords_fr.js');
import TokenizerFr = require('natural/lib/natural/tokenizers/aggressive_tokenizer_fr.js');

var tokenizer = new natural.WordTokenizer();

var stopwordsEn = natural.stopwords;
var stopwordsFr = stopwordsFrModule.words;

var frTok = new TokenizerFr();

var tokenizeEn = tokenizer.tokenize.bind(tokenizer);
var tokenizeFr = frTok.tokenize.bind(frTok);

var stemEn = natural.PorterStemmer.stem;
var stemFr = natural.PorterStemmerFr.stem;

function filterStopWordsEn(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsEn.indexOf(t) === -1;
    });
}

function filterStopWordsFr(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsFr.indexOf(t) === -1;
    });
}


var ret = new Map<string, (str: string) => string[]>()
ret.set('en', function toStemsEn(str: string){
    return stemEn( filterStopWordsEn( tokenizeEn(str) ).join(' ') ).split(' ')
});
ret.set('fr', function toStemsFr(str: string){
    return stemFr( filterStopWordsFr( tokenizeFr(str) ).join(' ') ).split(' ')
});

export = ret;