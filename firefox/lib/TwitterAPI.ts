'use strict';

import RequestModule = require("sdk/request");

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
                'trim_user': 't',
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
            
                
            twitterAPI.search({
                q: {
                    '@': user
                }
            })
            .then(tweets => console.log("tweets to user", user, tweets))
            .catch(e => console.error(e))
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
        
        lookupUsersByIds: function(user_ids: TwitterUserId[]){
            var searchString = makeSearchString({
                user_id: user_ids.join(','),
                include_entities : false
            });
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/users/lookup.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/users/lookup.json (ids) status',
                            user_ids,
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();

            });
        },
        
        lookupUsersByScreenNames: function(screen_names: string[]){
            var searchString = makeSearchString({
                screen_name: screen_names.join(','),
                include_entities : false
            });
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/users/lookup.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/users/lookup.json (screen names) status',
                            screen_names,
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();

            });
        },
        
        getFriends: function(user_id: TwitterUserId){
            var searchString = makeSearchString({
                user_id: user_id,
                stringify_ids : true,
                count: 5000
            });
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/friends/ids.json?'+searchString,
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/friends/ids.json status',
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                        );

                        resolve(response.json);
                    },
                    onError: reject
                }).get();

            });
        },
        
        // https://dev.twitter.com/rest/reference/get/help/languages
        getLanguages: function(){
            
            return new Promise((resolve, reject) => {
                var reqStart = Date.now();

                Request({
                    url: 'https://api.twitter.com/1.1/help/languages.json',
                    headers: {
                        'Authorization': 'Bearer '+accessToken
                    },
                    onComplete: function (response) {
                        console.log(
                            '/1.1/help/languages.json',
                            response.status, 
                            ((Date.now() - reqStart)/1000).toFixed(1)+'s',
                            response
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
