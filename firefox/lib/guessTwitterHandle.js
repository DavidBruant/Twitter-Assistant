'use strict';

const PageWorker = require("sdk/page-worker").Page;
const {data} =  require("sdk/self");

module.exports = function(){
    return new Promise((resolve, reject) => {
        const pw = PageWorker({
            contentURL: "https://twitter.com",
            contentScriptFile: data.url('guessTwitterHandle.js'),
            contentScriptWhen: 'ready'
        });
        
        pw.port.on('username', username => {
            pw.destroy();
            resolve(username);
        });
        
        pw.port.on('error', err => {
            pw.destroy();
            reject(new Error("username could not be found (either because the user isn't logged in or because Twitter changed its HTML)"));
        });
    });
};