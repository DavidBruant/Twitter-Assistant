'use strict';

const { defer } = require('sdk/core/promise');
const Request = require("sdk/request").Request;

const getAccessToken = require('getAccessToken.js');

module.exports = function TwitterAPI(accessToken){
    return {
        /*
            maxId: the caller needs to substract 1
            https://dev.twitter.com/docs/working-with-timelines
            ... or not:
            "Environments where a Tweet ID cannot be represented as an integer with 64 bits of
            precision (such as JavaScript) should skip this step."
        
        */
        getUserTimeline : function getUserTimeline(twittername, maxId){
            const deferred = defer();

            const reqStart = Date.now();
            
            const BASE_URL = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
            let url = BASE_URL + '?&include_rts=1&count=200'; // don't trim user that breaks recognizing conversation
            url += '&screen_name='+twittername;
            
            if(maxId){
                url += '&max_id='+maxId;
            }
            
            Request({
                url: url,
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
