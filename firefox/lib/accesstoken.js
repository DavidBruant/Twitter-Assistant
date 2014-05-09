'use strict';
// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
var XMLHttpRequest = require("sdk/net/xhr").XMLHttpRequest;
var base64 = require("sdk/base64");
const { defer } = require('sdk/core/promise');

// cache key is bearerTokenCredentails
var tokenCache = new Map();

module.exports = function getAccessToken(CONSUMER_KEY, CONSUMER_SECRET){
    var accessTokenDef = defer();

    var encodedConsumerKey = encodeURIComponent(CONSUMER_KEY);
    var encodedConsumerSecret = encodeURIComponent(CONSUMER_SECRET);

    var bearerTokenCredentails = encodedConsumerKey + ':' + encodedConsumerSecret;

    var b64bearerToken = base64.encode(bearerTokenCredentails);
    
    if(tokenCache.has(bearerTokenCredentails)){
        accessTokenDef.resolve(tokenCache.get(bearerTokenCredentails));
    }
    else{
        // Using ("sdk/net/xhr").XMLHttpRequest until https://bugzilla.mozilla.org/show_bug.cgi?id=1002229 ships to release (Firefox 32?)
        var xhr = new XMLHttpRequest({mozAnon: true});
        
        xhr.open('POST', "https://api.twitter.com/oauth2/token");
        
        xhr.setRequestHeader('Authorization', 'Basic '+b64bearerToken);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
        
        xhr.responseType = "json";
        
        xhr.addEventListener('load', e => {
            console.log('/oauth2/token status', xhr.status);
            
            if(xhr.status < 400){
                var token = xhr.response.access_token;

                tokenCache.set(bearerTokenCredentails, token);
                
                accessTokenDef.resolve(token);
            }
            else{
                accessTokenDef.reject('/oauth2/token error '+ xhr.status);
            }
            
        });
        
        xhr.addEventListener('error', e => {
            accessTokenDef.reject('/oauth2/token error '+ String(e));
        })
        
        xhr.send('grant_type=client_credentials');
    }
    
    return accessTokenDef.promise;
};
