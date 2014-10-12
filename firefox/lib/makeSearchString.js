'use strict';

// TODO get rid of this module when https://bugzilla.mozilla.org/show_bug.cgi?id=935223 is RESOLVED FIXED

module.exports = function makeSearchString(obj){
    const sp = [];
    
    // http://stackoverflow.com/a/3608791
    for(let k of Object.keys(obj))
        sp.push(encodeURI(k) + '=' + encodeURI(obj[k]));
    
    return sp.join('&');
}