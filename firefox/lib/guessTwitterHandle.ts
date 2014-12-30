'use strict';

import xhrModule = require("sdk/net/xhr");
import selfModule =  require("sdk/self");

var XMLHttpRequest = xhrModule.XMLHttpRequest;
var data = selfModule.data;

function guessTwitterHandle(){
    return new Promise<string>((resolve, reject) => {
        var reqStart = Date.now();

        var xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://twitter.com/');
        xhr.responseType = "document";
        
        xhr.onload = function(){
            if(xhr.status >= 400){
                reject(new Error('status code '+xhr.status))
            }
            else{
                var doc = xhr.response;
                var screenNameElement = doc.body.querySelector('.DashboardProfileCard .DashboardProfileCard-screenname');

                if(screenNameElement) // .slice(1) to remove the initial @
                    resolve(screenNameElement.textContent.trim().slice(1));
                else
                    reject('user not logged in or Twitter changed its HTML');
            }
        };
        
        xhr.send();
        
    });
};

export = guessTwitterHandle;