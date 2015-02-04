'use strict';
// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
import xhrModule = require("sdk/net/xhr");
import base64 = require("sdk/base64");

var XMLHttpRequest = xhrModule.XMLHttpRequest

// cache key is bearerTokenCredentails
var tokenCache = new Map<string, AccessToken>();

function getAccessToken(key: string, secret: string){
    return new Promise<AccessToken>((resolve, reject) => {
        var encodedConsumerKey = encodeURIComponent(key);
        var encodedConsumerSecret = encodeURIComponent(secret);

        var bearerTokenCredentials = encodedConsumerKey + ':' + encodedConsumerSecret;

        var b64bearerToken = base64.encode(bearerTokenCredentials);

        if(tokenCache.has(bearerTokenCredentials)){
            resolve(tokenCache.get(bearerTokenCredentials));
        }
        else{
            // Using ("sdk/net/xhr").XMLHttpRequest until https://bugzilla.mozilla.org/show_bug.cgi?id=1002229 ships to release (Firefox 32?)
            var xhr = new XMLHttpRequest({mozAnon: true});

            xhr.open('POST', "https://api.twitter.com/oauth2/token");

            xhr.setRequestHeader('Authorization', 'Basic '+b64bearerToken);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');

            xhr.responseType = "json";

            xhr.addEventListener('load', e => {
                console.log('/oauth2/token status', xhr.status);

                if(xhr.status < 400){
                    var token = xhr.response.access_token;

                    tokenCache.set(bearerTokenCredentials, token);

                    resolve(token);
                }
                else{
                    reject('/oauth2/token error '+ xhr.status);
                }

            });

            xhr.addEventListener('error', e => {
                reject('/oauth2/token error '+ String(e));
            })

            xhr.send('grant_type=client_credentials');
        }
    
    });
}

export = getAccessToken;
