// isTwitterProfileURL.js - TMetrics's module
// author: bruantd

var SINGLE_QUOTE = "'";

function isTwitterProfileURL(u){
    return u.match(/^https?:\/\/twitter\.com\/([^\/]+)\/?$/);
};

var truthy = [
   'https://twitter.com/DavidBruant',
   'http://twitter.com/DavidBruant',
   'https://twitter.com/DavidBruant/',
   'http://twitter.com/DavidBruant/',
   'https://twitter.com/a',
   'https://twitter.com/q1/',
   'https://twitter.com/a',
   'https://twitter.com/q1/'
];

var falsy = [
    '',
    ' ',
    'twitter.com/bla',
    'javascript:alert("blue")',
    'https://twitter.com/DavidBruant/what',
    'https://twitter.com/DavidBruant/what/',
];


truthy.forEach(function(s){
    if(!isTwitterProfileURL(s))
        throw new Error(SINGLE_QUOTE+s+SINGLE_QUOTE+" should be truthy");
});

falsy.forEach(function(s){
    if(isTwitterProfileURL(s))
        throw new Error(SINGLE_QUOTE+s+SINGLE_QUOTE+" should be falsy");
});


module.exports = isTwitterProfileURL;
