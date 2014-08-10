'use strict';

const passwordSearch = require("sdk/passwords").search;

const TWITTER_APP_LOGIN_PAGE = "https://dev.twitter.com/user/login?destination=home";
const PASSWORD_URL_DOMAIN_CANDIDATES = [ // in order of importance
    'https://dev.twitter.com',
    'http://dev.twitter.com',
    'https://twitter.com',
    'http://twitter.com'
];
    
function getPasswordsForUrl(url, username){
    return new Promise((resolve, reject) => {
        passwordSearch({
            username: username,
            url: url,
            onComplete: function(credentials){
                resolve(Array.isArray(credentials) && credentials.length >= 1 ?
                    credentials[0] : // there should be a single entry for a (username, url) pair
                    undefined
                )
            },
            onError: reject
        });
    });
}

/*
    returns a Promise for a credentials object
*/
function getMostImportantPassword(passwordPs){
    //console.log('getMostImportantPassword', passwordPs.length);
    
    if(passwordPs.length === 0){
        return new Promise(resolve => resolve(undefined));
    }
    else{
        // const [first, ...tail] = passwordPs; Waiting for https://bugzilla.mozilla.org/show_bug.cgi?id=933276
        const first = passwordPs[0];
        const tail = passwordPs.slice(1);
        
        return first.then(credentials => {
            return credentials !== undefined ? 
                credentials : // credentials found, stop the search
                getMostImportantPassword(tail) ; // credentials not found, look for next URL
        });
    }
}


module.exports = function(username){
    if(!username)
        throw new Error('missing username');
    
    return new Promise((resolve, reject) => {
        const passwordPs = PASSWORD_URL_DOMAIN_CANDIDATES.map(url => getPasswordsForUrl(url, username));
        resolve(getMostImportantPassword(passwordPs));
    })
}