'use strict';

const { defer } = require('sdk/core/promise');
var Request = require("sdk/request").Request;
var accessTokenP = require('accesstoken.js');

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
