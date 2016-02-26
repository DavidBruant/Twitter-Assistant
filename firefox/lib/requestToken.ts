'use strict';
// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
import xhrModule = require("sdk/net/xhr");

const XMLHttpRequest = xhrModule.XMLHttpRequest

function requestToken(twitterAssistantServerOrigin: string, callbackURL: string){
    return new Promise<AccessToken>((resolve, reject) => {
        const xhr = new XMLHttpRequest({mozAnon: true});
        const url = twitterAssistantServerOrigin + '/oauth/request_token'
        
        xhr.open('POST', url);
        xhr.responseType = "json";

        xhr.addEventListener('load', e => {
            console.log('/oauth2/token status', xhr.status);

            if(xhr.status < 400){
                throw 'redirect user';
                resolve();
            }
            else{
                reject(url +' HTTP error '+ xhr.status);
            }

        });

        xhr.addEventListener('error', e => {
            reject(url +' error '+ String(e));
        })

        xhr.send(JSON.stringify({callbackURL: callbackURL}));
    });
}

export = requestToken;
