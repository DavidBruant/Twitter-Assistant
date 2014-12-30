'use strict';

// TODO get rid of this module when https://bugzilla.mozilla.org/show_bug.cgi?id=935223 is RESOLVED FIXED

function makeSearchString(obj: any){
    var sp : string[] = [];
    
    // http://stackoverflow.com/a/3608791
    Object.keys(obj).forEach( k => sp.push(encodeURI(k) + '=' + encodeURI(obj[k])) );
    
    return sp.join('&');
}

export = makeSearchString;