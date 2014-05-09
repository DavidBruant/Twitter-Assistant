'use strict';
// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
var Request = require("sdk/request").Request;
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
        
        Request({
            url: "https://api.twitter.com/oauth2/token",
            headers: {
                'Authorization': 'Basic '+b64bearerToken,
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Cookie': ''
            },
            onComplete: function (response) {
                console.log('/oauth2/token status', response.status);

                var token = response.json.access_token;
                
                tokenCache.set(bearerTokenCredentails, token);
                
                accessTokenDef.resolve(token);
                //console.log('accessToken', token);
            },
            content: 'grant_type=client_credentials'
        }).post();
    }
    
    return accessTokenDef.promise;
};
