'use strict';

const Request = require("sdk/request").Request;

const getAccessToken = require('./getAccessToken.js');
const makeSearchString = require('./makeSearchString.js');

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            if (target == null) {
                throw new TypeError("can't convert " + target + " to object");
            }
            var to = Object(target);
            if (arguments.length === 1) return to;
            var i = 1;
            do {
                var nextSource = arguments[i];
                if (nextSource === null || nextSource === undefined) continue;
                var from = Object(nextSource);
                var keysArray = Object.keys(from);
                var len = keysArray.length;
                var nextIndex = 0;
                while (nextIndex < len) {
                    var nextKey = keysArray[nextIndex];
                    to[nextKey] = from[nextKey];
                    nextIndex++;
                }
            } while (++i < arguments.length);
            return to;
        }
    });
}

const str = Function.prototype.call.bind( Object.prototype.toString );

function stringifyTwitterSearchQuery(obj){
    const queryParts = [];
    
    if(obj.text)
        queryParts.push(obj.text);
    
    Object.keys(obj).forEach(k => {
        if(k === 'text')
            return;
        
        let val = obj[k];
        
        if(str(val) === str(new Date()))
            val = val.toISOString().slice(0, 10); // keep only "2014-08-30"

        queryParts.push(k + ':' + val); // don't urlencode. It'll be done by makeSearchString 
    });

    return queryParts.join('+');
}

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

            const searchObj = {
                count: 200,
                include_rts: 1,
                // 'trim_user': 't' // https://github.com/DavidBruant/Twitter-Assistant/issues/52
                screen_name : twittername
            };

            if(maxId){
                searchObj['max_id'] = maxId;
            }

            const searchString = makeSearchString(searchObj);

            return new Promise((resolve, reject) => {
                const reqStart = Date.now();

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
            const q = stringifyTwitterSearchQuery(parameters.q);

            const searchString = makeSearchString(Object.assign(
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
                const reqStart = Date.now();
                
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


        }
    };
};
