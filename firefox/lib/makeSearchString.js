'use strict';

// TODO get rid of this module when https://bugzilla.mozilla.org/show_bug.cgi?id=935223 is RESOLVED FIXED

module.exports = function makeSearchString(obj){
    const sp = [];
    
    Object.keys(obj).forEach(k => {
        sp.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])); 
    });
    
    return sp.join('&');
}