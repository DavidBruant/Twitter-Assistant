'use strict';

// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
var Request = require("sdk/request").Request;
var base64 = require("sdk/base64");
const { defer } = require('sdk/core/promise');

var CONSUMER_KEY = 'Xo8vq7IMO8ktlUa2pXts6w';
var CONSUMER_SECRET = 'JhHMeTHYxTQ3BdoAE4jTBkwuju9WBJDqz5b2xpiD4';

var encodedConsumerKey = encodeURIComponent(CONSUMER_KEY);
var encodedConsumerSecret = encodeURIComponent(CONSUMER_SECRET);

var bearerTokenCredentails = encodedConsumerKey + ':' + encodedConsumerSecret;

var b64bearerToken = base64.encode(bearerTokenCredentails);


var accessTokenP = (function(){
    var accessTokenDef = defer();
    
    Request({
        url: "https://api.twitter.com/oauth2/token",
        headers: {
            'Authorization': 'Basic '+b64bearerToken,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        onComplete: function (response) {
            console.log('/oauth2/token status', response.status);
            
            accessTokenDef.resolve(response.json.access_token);
            console.log('accessToken', response.json.access_token);
        },
        content: 'grant_type=client_credentials'
    }).post();
    
    return accessTokenDef.promise;
})();

module.exports = function(twittername){
    var deferred = defer();
    
    accessTokenP.then(function(accessToken){
    
        Request({
            url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=100&screen_name='+twittername,
            headers: {
                'Authorization': 'Bearer '+accessToken
            },
            onComplete: function (response) {
                console.log('/1.1/statuses/user_timeline.json status', response.status);

                deferred.resolve(response.json);
            }, // deferred.reject(event);
            content: 'grant_type=client_credentials'
        }).get();
        
    });
    
    return deferred.promise;
};


