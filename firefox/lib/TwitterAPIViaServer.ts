'use strict';

import RequestModule = require("sdk/request");
import makeQueryString = require('./makeSearchString');


const Request = RequestModule.Request;

const str = Function.prototype.call.bind( Object.prototype.toString ); 

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

function TwitterAPIViaServer(oauth: {oauth_token: string, oauth_token_secret: string}, serverOrigin: string) : TwitterAPI_I{
    
    const twitterAssistantSigningServerAPIURL = serverOrigin + '/oauth/sign';
    
    function twitterAPIRequestDance(method: string, url: string, query?: any){
        return new Promise((resolve, reject) => {
            throw 'Handle rejection cases';
            const reqStart = Date.now();

            // Get the signature
            Request({
                url: twitterAssistantSigningServerAPIURL,
                contentType: 'application/json',
                content: JSON.stringify({
                    method: method,
                    url: url,
                    query: query,
                    oauth: oauth
                }),
                anonymous: true,
                onComplete: response => {
                    console.log(
                        'signature',
                        response.status, 
                        ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                    );

                    // Signature!
                    const signature = response.text;

                    // Send the signed request to Twitter
                    Request({
                        url: url + '?' + makeQueryString(query),
                        headers: {
                            'Authorization': makeOauthAuthorizationHeader({ signature: signature }) 
                        },
                        anonymous: true,
                        onComplete: response => {
                            console.log(
                                'url',
                                response.status, 
                                ((Date.now() - reqStart)/1000).toFixed(1)+'s'
                            );

                            resolve(response.json);
                        }
                    }).get();

                },
                onError: reject
            }).post();

        });
    }
    
    return {
        /*
            maxId: the caller needs to substract 1
            https://dev.twitter.com/docs/working-with-timelines
            ... or not:
            "Environments where a Tweet ID cannot be represented as an integer with 64 bits of
            precision (such as JavaScript) should skip this step."
        */
        getUserTimeline : function getUserTimeline(twittername: string, maxId?:TwitterTweetId){
            const searchObj: TwitterAPIUserTimelineOptions = {
                count: 200,
                include_rts: 1,
                'trim_user': 't',
                screen_name : twittername
            };

            if(maxId){
                searchObj['max_id'] = maxId;
            }

            return twitterAPIRequestDance(
                'GET',
                'https://api.twitter.com/1.1/statuses/user_timeline.json',
                searchObj
            )
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
        search: function(searchParams){
            const q = stringifyTwitterSearchQuery(searchParams.q);

            const parameters = (<any>Object).assign(
                {},
                { // defaults
                    count: 100,
                    result_type: 'recent'
                },
                {q: q}
            );
            
            return twitterAPIRequestDance(
                'GET',
                'https://api.twitter.com/1.1/search/tweets.json',
                parameters
            );
        },
        
        lookupUsersByIds: function(user_ids: TwitterUserId[]){
            const parameters = {
                user_id: user_ids.join(','),
                include_entities : false
            };
            
            return twitterAPIRequestDance(
                'GET',
                'https://api.twitter.com/1.1/users/lookup.json',
                parameters
            );
        },
        
        lookupUsersByScreenNames: function(screen_names: string[]){
            const parameters = {
                screen_name: screen_names.join(','),
                include_entities : false
            };
            
            return twitterAPIRequestDance(
                'GET',
                'https://api.twitter.com/1.1/users/lookup.json',
                parameters
            );
        },
        
        getFriends: function(user_id: TwitterUserId){
            const parameters = {
                user_id: user_id,
                stringify_ids : true,
                count: 5000
            };
            
            return twitterAPIRequestDance(
                'GET',
                'https://api.twitter.com/1.1/friends/ids.json',
                parameters
            );
        },
        
        // https://dev.twitter.com/rest/reference/get/help/languages
        getLanguages: function(){
            return twitterAPIRequestDance('GET', 'https://api.twitter.com/1.1/help/languages.json');
        },
        
        verifyCredentials: function(){
            return twitterAPIRequestDance('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json');
        }
    
    };
}

export = TwitterAPIViaServer;
