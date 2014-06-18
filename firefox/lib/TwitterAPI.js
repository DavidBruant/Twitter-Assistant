'use strict';

const { defer } = require('sdk/core/promise');
const Request = require("sdk/request").Request;

const getAccessToken = require('getAccessToken.js');

module.exports = function TwitterAPI(accessToken){
    return {
        getUserTimeline : function getUserTimeline(twittername){
            var deferred = defer();

            var reqStart = Date.now();
            
            Request({
                url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name='+twittername,
                headers: {
                    'Authorization': 'Bearer '+accessToken
                },
                onComplete: function (response) {
                    console.log(
                        '/1.1/statuses/user_timeline.json status',
                        response.status, 
                        ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                    );

                    deferred.resolve(response.json);
                }
            }).get();

            return deferred.promise;
        }
    };
};
