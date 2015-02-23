'use strict';

import RequestModule = require("sdk/request");

import getAccessToken = require('./getAccessToken');
import makeSearchString = require('./makeSearchString');

var Request = RequestModule.Request;

var str = Function.prototype.call.bind( Object.prototype.toString );

function stringifyTwitterSearchQuery(obj: any){
    var queryParts: string[] = [];
    
    if(obj.text)
        queryParts.push(obj.text);
    
    Object.keys(obj).forEach(k => {
        if(k === 'text')
            return;
        
        var val = obj[k];
        
        if(str(val) === str(new Date()))
            val = val.toISOString().slice(0, 10); // keep only "2014-08-30"

        queryParts.push(k + ':' + val); // don't urlencode. It'll be done by makeSearchString 
    });

    return queryParts.join('+');
}

function TwitterAPI(accessToken: AccessToken) : TwitterAPI_I{
    return {
        /*
            maxId: the caller needs to substract 1
            https://dev.twitter.com/docs/working-with-timelines
            ... or not:
            "Environments where a Tweet ID cannot be represented as an integer with 64 bits of
            precision (such as JavaScript) should skip this step."
        */
        getUserTimeline : function getUserTimeline(twittername: string, maxId?:TwitterTweetId){

            var searchObj: TwitterAPIUserTimelineOptions = {
                count: 200,
                include_rts: 1,
                // 'trim_user': 't' // https://github.com/DavidBruant/Twitter-Assistant/issues/52
                screen_name : twittername
            };

            if(maxId){
                searchObj['max_id'] = maxId;
            }

            var searchString = makeSearchString(searchObj);

            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/statuses/user_timeline.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/statuses/user_timeline.json status',
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();

            });
        },
        /*
            https://dev.twitter.com/docs/api/1.1/get/search/tweets
            https://dev.twitter.com/docs/using-search

            parameters : {
                q: {
                    text: string, // the string shouldn't be encoded
                    from: string,
                    to: string,
                    '@': string,
                    since: date,
                    until: date,
                    filter: string,
                },
                since_id: string,
                max_id: string,
                count: number,
                result_type: string ( mixed, recent, popular),
                lang: string,
                geocode: string
            }
        */
        search: function(parameters){
            var q = stringifyTwitterSearchQuery(parameters.q);

            var searchString = makeSearchString((<any>Object).assign(
                {},
                { // defaults
                    count: 100,
                    result_type: 'recent'
                },
                parameters,
                {q: q}
            ));

            console.log("searchString", searchString)
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();
                
                Request({
                    url: 'https://api.twitter.com/1.1/search/tweets.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/search/tweets.json status',
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();               
                                   
            })
        },
        
        lookupUsers: function(user_ids: string[], screen_names?: string[]){
            if(!user_ids) user_ids = [];
            if(!screen_names) screen_names = [];
            
            var searchObj = {
                user_id: user_ids.length > 0 ?
                    user_ids.map(id => String(id)).join(',') :
                    undefined,
                screen_name: screen_names.length > 0 ?
                    screen_names.map(id => String(id)).join(',') :
                    undefined,
                include_entities : false
            };

            var searchString = makeSearchString(searchObj);
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/users/lookup.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/users/lookup.json status',
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();

            });
        }
    };
}

export = TwitterAPI;
