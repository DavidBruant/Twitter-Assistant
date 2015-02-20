"use strict";

//var assert = assert = require('chai').assert;
var assert = {
    isTrue: function(x, msg){
        if(x !== true)
            console.error('should be true', msg)
    },
    isFalse: function(x, msg){
        if(x !== false)
            console.error('should be false', msg)
    },
    equal: function(x, y, msg){
        if(!Object.is(x, y))
            console.error('expected', x, 'to ===', y, msg);
        
        return Object.is(x, y);
    }
}

function extractUserFromUrl(str){
    var matches = str.match(/^https?:\/\/twitter\.com\/([^\/\?]+)[\/\?]?/);

    if(!Array.isArray(matches) || matches.length < 2)
        return;
    return matches[1];
}


[
    'http://twitter.com/abc',
    'https://twitter.com/abc',
    'https://twitter.com/abc?yo=ya',
    'https://twitter.com/abc?_utm=whatever'
].forEach(function(str){
    assert.equal(extractUserFromUrl(str), 'abc', str);
});

