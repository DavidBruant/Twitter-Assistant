/// <reference path="../../defs/natural.d.ts" />

"use strict";

import natural = require('natural');

import stopwordsFrModule = require('natural/lib/natural/util/stopwords_fr.js');
import TokenizerFr = require('natural/lib/natural/tokenizers/aggressive_tokenizer_fr.js');

import stopwordsEsModule = require('natural/lib/natural/util/stopwords_es.js');
import TokenizerEs = require('natural/lib/natural/tokenizers/aggressive_tokenizer_es.js');

import stopwordsJa = require('natural/lib/natural/util/stopwords_ja.js');
import TokenizerJa = require('natural/lib/natural/tokenizers/tokenizer_ja.js');
import StemmerJa = require('natural/lib/natural/stemmers/stemmer_ja.js');

import stopwordsItModule = require('natural/lib/natural/util/stopwords_it.js');
import TokenizerIt = require('natural/lib/natural/tokenizers/aggressive_tokenizer_it.js');

import stopwordsRuModule = require('natural/lib/natural/util/stopwords_ru.js');
import TokenizerRu = require('natural/lib/natural/tokenizers/aggressive_tokenizer_ru.js');

import stopwordsPtModule = require('natural/lib/natural/util/stopwords_pt.js');
import TokenizerPt = require('natural/lib/natural/tokenizers/aggressive_tokenizer_pt.js');
import stemmerPt = require('natural/lib/natural/stemmers/porter_stemmer_pt.js');

import stopwordsNlModule = require('natural/lib/natural/util/stopwords_nl.js');
import TokenizerNl = require('natural/lib/natural/tokenizers/aggressive_tokenizer_nl.js');

import stopwordsNoModule = require('natural/lib/natural/util/stopwords_no.js');
import TokenizerNo = require('natural/lib/natural/tokenizers/aggressive_tokenizer_no.js');

import stopwordsFaModule = require('natural/lib/natural/util/stopwords_fa.js');
import TokenizerFa = require('natural/lib/natural/tokenizers/aggressive_tokenizer_fa.js');

import stopwordsPlModule = require('natural/lib/natural/util/stopwords_pl.js');
import TokenizerPl = require('natural/lib/natural/tokenizers/aggressive_tokenizer_pl.js');
import stemmerPl = require('natural/lib/natural/stemmers/stemmer_pl.js');



// list of Twitter languages
// done : ["fr", "en", "en-gb", "ja", "es", "it", "pt", "ru", "nl", "no", "fa", "pl"]
// todo : ["de","ar","id","ko","tr","fil","msa","zh-tw","zh-cn","hi","sv","fi","da","hu","fa","he","th","uk","cs","ro","vi","bn"]
// this list was exported as one-time export of https://dev.twitter.com/rest/reference/get/help/languages via Twitter
// online Oauth tool on Sept 3rd 2015
//
// Full object [{"code":"fr","name":"Fran\u00e7ais","status":"production"},{"code":"en","name":"Anglais","status":"production"},{"code":"ar","name":"Arabe","status":"production"},{"code":"ja","name":"Japonais","status":"production"},{"code":"es","name":"Espagnol","status":"production"},{"code":"de","name":"Allemand","status":"production"},{"code":"it","name":"Italien","status":"production"},{"code":"id","name":"Indon\u00e9sien","status":"production"},{"code":"pt","name":"Portugais","status":"production"},{"code":"ko","name":"Cor\u00e9en","status":"production"},{"code":"tr","name":"Turc","status":"production"},{"code":"ru","name":"Russe","status":"production"},{"code":"nl","name":"N\u00e9erlandais","status":"production"},{"code":"fil","name":"Filipino","status":"production"},{"code":"msa","name":"Malais","status":"production"},{"code":"zh-tw","name":"Chinois traditionnel","status":"production"},{"code":"zh-cn","name":"Chinois simplifi\u00e9","status":"production"},{"code":"hi","name":"Hindi","status":"production"},{"code":"no","name":"Norv\u00e9gien","status":"production"},{"code":"sv","name":"Su\u00e9dois","status":"production"},{"code":"fi","name":"Finnois","status":"production"},{"code":"da","name":"Danois","status":"production"},{"code":"pl","name":"Polonais","status":"production"},{"code":"hu","name":"Hongrois","status":"production"},{"code":"fa","name":"Persan","status":"production"},{"code":"he","name":"H\u00e9breu","status":"production"},{"code":"th","name":"Tha\u00ef","status":"production"},{"code":"uk","name":"Ukrainien","status":"production"},{"code":"cs","name":"Tch\u00e8que","status":"production"},{"code":"ro","name":"Roumain","status":"production"},{"code":"en-gb","name":"Anglais britannique","status":"production"},{"code":"vi","name":"Vietnamien","status":"production"},{"code":"bn","name":"Bengali","status":"production"}]

var stemmersByLang = new Map<string, (str: string) => string[]>()


// English
// TODO use the normalizer https://github.com/NaturalNode/natural/blob/master/lib/natural/normalizers/normalizer.js
var tokenizer = new natural.WordTokenizer();
var tokenizeEn = tokenizer.tokenize.bind(tokenizer);
var stopwordsEn = natural.stopwords;
var stemEn = natural.PorterStemmer.stem;

// Keep an eye on https://github.com/NaturalNode/natural/issues/257
function filterStopWordsEn(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsEn.indexOf(t.toLowerCase()) === -1 && t !== 'not';
    });
}

stemmersByLang.set('en', function toStemsEn(str: string){
    return stemEn( filterStopWordsEn( tokenizeEn(str) ).join(' ') ).split(' ')
});
// I hope @angustweets and other brits won't be mad at me for this
stemmersByLang.set('en-gb', function toStemsEn(str: string){
    return stemEn( filterStopWordsEn( tokenizeEn(str) ).join(' ') ).split(' ')
});


// French
var frTok = new TokenizerFr();
var tokenizeFr = frTok.tokenize.bind(frTok);
var stopwordsFr = stopwordsFrModule.words;
var stemFr = natural.PorterStemmerFr.stem;

function filterStopWordsFr(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsFr.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('fr', function toStemsFr(str: string){
    return stemFr( filterStopWordsFr( tokenizeFr(str) ).join(' ') ).split(' ')
});


// Spanish
var esTok = new TokenizerEs();
var tokenizeEs = esTok.tokenize.bind(esTok);
var stopwordsEs = stopwordsEsModule.words;
var stemEs = natural.PorterStemmerEs.stem;

function filterStopWordsEs(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsEs.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('es', function toStemsEs(str: string){
    return stemEs( filterStopWordsEs( tokenizeEs(str) ).join(' ') ).split(' ')
});


// Japanese
var jaTok = new TokenizerJa();
var tokenizeJa = jaTok.tokenize.bind(jaTok);
//var stopwordsJa
var stemJa = new StemmerJa();

function filterStopWordsJa(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsJa.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('ja', function toStemsJa(str: string){
    return stemJa.stem( filterStopWordsJa( tokenizeJa(str) ).join(' ') ).split(' ')
});



// Italian
var itTok = new TokenizerIt();
var tokenizeIt = itTok.tokenize.bind(itTok);
var stopwordsIt = stopwordsItModule.words;
var stemIt = natural.PorterStemmerIt.stem;

function filterStopWordsIt(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsIt.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('it', function toStemsIt(str: string){
    return stemIt( filterStopWordsIt( tokenizeIt(str) ).join(' ') ).split(' ')
});



// Russian
var ruTok = new TokenizerRu();
var tokenizeRu = ruTok.tokenize.bind(ruTok);
var stopwordsRu = stopwordsRuModule.words;
var stemRu = natural.PorterStemmerRu.stem;

function filterStopWordsRu(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsRu.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('ru', function toStemsRu(str: string){
    return stemRu( filterStopWordsRu( tokenizeRu(str) ).join(' ') ).split(' ')
});



// Portugese
var ptTok = new TokenizerPt();
var tokenizePt = ptTok.tokenize.bind(ptTok);
var stopwordsPt = stopwordsPtModule.words;
var stemPt = stemmerPt.stem.bind(stemmerPt);

function filterStopWordsPt(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsPt.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('pt', function toStemsPt(str: string){
    return stemPt( filterStopWordsPt( tokenizePt(str) ).join(' ') ).split(' ')
});



// Dutch
var nlTok = new TokenizerNl();
var tokenizeNl = nlTok.tokenize.bind(nlTok);
var stopwordsNl = stopwordsNlModule.words;
// no stemmer yet https://github.com/NaturalNode/natural/issues/165
//var stemNl = natural.PorterStemmerNl.stem; 
var stemNl = (s: string) => s;

function filterStopWordsNl(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsNl.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('nl', function toStemsNl(str: string){
    return stemNl( filterStopWordsNl( tokenizeNl(str) ).join(' ') ).split(' ')
});



// Norwegian
var noTok = new TokenizerNo();
var tokenizeNo = noTok.tokenize.bind(noTok);
var stopwordsNo = stopwordsNoModule.words;
var stemNo = natural.PorterStemmerNo.stem; 

function filterStopWordsNo(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsNo.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('no', function toStemsNo(str: string){
    return stemNo( filterStopWordsNo( tokenizeNo(str) ).join(' ') ).split(' ')
});



// Farsi
var faTok = new TokenizerFa();
var tokenizeFa = faTok.tokenize.bind(faTok);
var stopwordsFa = stopwordsFaModule.words;
var stemFa = natural.PorterStemmerFa.stem; 

function filterStopWordsFa(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsFa.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('fa', function toStemsFa(str: string){
    return stemFa( filterStopWordsFa( tokenizeFa(str) ).join(' ') ).split(' ')
});



// Polish
/*var plTok = new TokenizerPl();
var tokenizePl = plTok.tokenize.bind(plTok);
var stopwordsPl = stopwordsPlModule.words;
var stemPl = stemmerPl; 

function filterStopWordsPl(tokens: string[]){
    return tokens.filter(function(t){
        return stopwordsPl.indexOf(t.toLowerCase()) === -1;
    });
}

stemmersByLang.set('pl', function toStemsPl(str: string){
    return stemPl( filterStopWordsPl( tokenizePl(str) ).join(' ') ).split(' ')
});*/





export = stemmersByLang;