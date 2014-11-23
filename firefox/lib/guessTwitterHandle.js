'use strict';

const {data} = require("sdk/self");
const {XMLHttpRequest} = require('sdk/net/xhr');

module.exports = function(){
    return new Promise((resolve, reject) => {
        const reqStart = Date.now();

        const xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://twitter.com/');
        xhr.responseType = "document";
        
        xhr.onload = function(){
            if(xhr.status >= 400){
                reject(new Error('status code '+xhr.status))
            }
            else{
                const doc = xhr.response;
                const screenNameElement = doc.body.querySelector('.DashboardProfileCard .DashboardProfileCard-screenname');

                if(screenNameElement) // .slice(1) to remove the initial @
                    resolve(screenNameElement.textContent.trim().slice(1));
                else
                    reject('user not logged in or Twitter changed its HTML');
            }
        };
        
        xhr.send();
        
    });
};