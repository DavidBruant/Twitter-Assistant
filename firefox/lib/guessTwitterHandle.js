'use strict';

const PageWorker = require("sdk/page-worker").Page;


module.exports = function(){
    return new Promise((resolve, reject) => {
        const pw = PageWorker({
            contentURL: "https://twitter.com",
            contentScript: 
                "let screenNameElement = document.body.querySelector('.DashboardProfileCard .DashboardProfileCard-screenname');"+
                // .slice(1) to remove the initial @
                "if(screenNameElement) self.port.emit('username', screenNameElement.textContent.trim().slice(1));" +
                "else self.port.emit('error');", 
            contentScriptWhen: 'ready'
        });
        
        pw.port.on('username', username => {
            pw.destroy();
            resolve(username);
        });
        
        pw.port.on('error', username => {
            pw.destroy();
            reject(new Error("username could not be found (either because the user isn't logged in or because Twitter changed its HTML)"));
        });
    });
};