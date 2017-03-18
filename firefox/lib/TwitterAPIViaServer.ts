'use strict';

/**
 * This modules contains all the code that manages oauth tokens so these don't leak 
 * in other parts of the program. 
 * It specifically implements a way of accessing the Twitter API that does not just 
 * go through a server as the Twitter API is usually intended to be called. It first
 * sends the Twitter API request via a server and then sends the request to the
 * Twitter API directly without going through the server. This saves bandwidth to
 * whoever pays for the server as well as marginally improves perf since the Twitter
 * API data goes directly from the Twitter servers to the addon without having to go
 * through an intermediary server. There is also a marginal privacy improvement.   
 * 
 */

import RequestModule = require("sdk/request");
import makeQueryString = require('./makeSearchString');
import getOauthRequestToken = require('./requestToken');

/**
 * # Oauth flow
 * 
 * ## Call to API
 * 
 * URL + params + Authorization header
 * 
 * Authorization header is composed of:
 * * Signature
 *      * oauth_consumer_key
 *      * oauth_consumer_secret
 *      * oauth_token (access)
 *      * oauth_token_secret (access)
 *  * oauth_consumer_key
 *  * oauth_token
 * 
 *  oauth_token is an access_token
 * 
 * 
 * ## Getting an access token
 * 
 * Call to /oauth/authenticate with:
 * * oauth_token (request)
 * 
 * => oauth_token (access) from URL bar in callback URL
 * 
 * 
 * ## Getting a request token
 * 
 * Call to /oauth/request_token with:
 * * callbackURL
 * x consumer_key
 * x consumer_secret
 * 
 * => oauth_token (request)
 * => oauth_token_secret (request)
 * 
 */


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

function _twitterAPIRequestDance(oauthP, twitterAssistantSigningServerAPIURL: string, method: string, url: string, query?: any){
    return oauthP.then(oauth => {
        return new Promise( (resolve, reject) => {
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

                    if(response.status >= 400){
                        reject(new Error('Signature error '+response.status))
                        return;
                    }

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

                            if(response.status >= 400){
                                reject(new Error('Twitter API error '+response.status))
                                return;
                            }

                            resolve(response.json);
                        },
                        onError: reject
                    }).get();

                },
                onError: reject
            }).post();
        })
    })    
}



function TwitterAPIViaServer(rememberOauth, requestUserTwitterSignin, twitterAssistantServerOrigin: string) : TwitterAPI_I{
    
    const twitterAssistantSigningServerAPIURL = twitterAssistantServerOrigin + '/oauth/sign';
    const twitterCallbackURL = twitterAssistantServerOrigin + '/twitter/callback';

    // is there a saved token?

    let twitterAPIRequestDance;
    let oauthAccessTokenPairP;

    function createOauthAccessTokenPair(){
        let oauthRequestTokenPair;

        return requestUserTwitterSignin( () => {
            return getOauthRequestToken(twitterAssistantServerOrigin, twitterCallbackURL)
            .then(_oauthRequestTokenPair => {
                oauthRequestTokenPair = _oauthRequestTokenPair;
                return {
                    twitterAuthenticateURL: [
                        'https://api.twitter.com/oauth/authenticate',
                        '?',
                        makeQueryString({oauth_token: oauthRequestTokenPair.oauth_token})
                    ].join(''),
                    twitterCallbackURL: twitterCallbackURL
                };
            })
        })
        .then(oauthAccessToken => ({
            oauth_token: oauthAccessToken,
            oauth_token_secret: oauthRequestTokenPair.oauth_token_secret
        }))
    }


    /*function getTwitterAuthenticateURL(){
        return oauthP
    }*/

    const res = {

        /*getValidToken: () => {
            oauthP = Promise.resolve(rememberOauth())
            .then(oauth => {
                return oauth ?
                    // is the saved token still valid?
                    _twitterAPIRequestDance(
                        Promise.resolve(oauth), twitterAssistantSigningServerAPIURL,
                        'GET', 'https://api.twitter.com/1.1/account/verify_credentials.json'
                    )
                    .then(user => oauth)
                    .catch(e => {
                        rememberOauth(''); // forget invalid tokens
                        return requestToken(serverOrigin, twitterCallbackURL)
                    }) :
                    // undefined and empty string cases
                    requestToken(serverOrigin, twitterCallbackURL)
            })
            .then(validOauth => {
                rememberOauth(validOauth);

                return validOauth;
            });

            return oauthP;
        },*/

        /**
         * Instead of systematically calling this function and hit the Twitter API, the last time 
         * the credentials were seen working (any API call) could be saved and if below, say, 2 hour, then
         * a call to /account/verify_credentials.json could be performed
         * 
         */
        verifyCredentials: function(){
            return twitterAPIRequestDance('GET', 'https://api.twitter.com/1.1/account/verify_credentials.json');
        },

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
        }
    
    };

    /**
     * INIT
     */

    // see whether there is an access token pair.
        // if so: verify it's still valid
            // if so: use it.
            // if not: ditch it + ask for request token + ask permission to use (thus creating oauth access pair)
        // if not
            // ask for request token + ask permission to use (thus creating oauth access pair)

    twitterAPIRequestDance = _twitterAPIRequestDance.bind(
        undefined, 
        res.getValidToken(), 
        twitterAssistantSigningServerAPIURL
    );

    return res;
}

export = TwitterAPIViaServer;
