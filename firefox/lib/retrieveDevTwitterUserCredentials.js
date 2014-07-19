'use strict';

const TWITTER_APP_LOGIN_PAGE = "https://dev.twitter.com/user/login?destination=home";
const PASSWORD_URL_DOMAIN_CANDIDATES = [ // in order of importance
    TWITTER_APP_LOGIN_PAGE,
    'https://dev.twitter.com/user/login',
    'https://dev.twitter.com',
    'http://dev.twitter.com',
    'https://twitter.com',
    'http://twitter.com'
];
    
function getPasswordsForUrl(url){
    return new Promise((resolve, reject) => {
        passwords.search({
            url: url,
            onComplete: function(credentials){
                if(Array.isArray(credentials) && credentials.length >= 1)
                    resolve(credentials);
                else
                    reject(new Error('no password for '+url));
            },
            onError: reject
        });
    });
}

function getMostImportantPassword(passwordPs){
    //console.log('getMostImportantPassword', passwordPs.length);
    
    if(passwordPs.length === 0){
        return new Promise((resolve, reject) => reject(new Error('no password'))); // TODO : resolve to null to signify no credentials
    }
    else{
        const first = passwordPs[0];
        const rest = passwordPs.slice(1);
        
        return first.then(credentials => {
            //console.log('getMostImportantPassword resolve', credentials)
            resolve(credentials);
        })
        .catch(err => {
            //console.log('getMostImportantPassword rest')
            return getMostImportantPassword(rest);
        })
    }
}


module.exports = function(){
    return new Promise((resolve, reject) => {
        const passwordPs = PASSWORD_URL_DOMAIN_CANDIDATES.map(getPasswordsForUrl);
        resolve(getMostImportantPassword(passwordPs));
    })
}