'use strict';

const PageWorker = require("sdk/page-worker").Page;


module.exports = function(){
    return new Promise(resolve => {
        const pw = PageWorker({
            contentURL: "https://twitter.com",
            contentScript: 
                "let screenNameElement = document.body.querySelector('.DashboardProfileCard .DashboardProfileCard-screenname');"+
                // .slice(1) to remove the initial @
                "self.port.emit('username', screenNameElement ? screenNameElement.textContent.trim().slice(1) : undefined);", 
            contentScriptWhen: 'ready'
        });
        
        pw.port.on('username', username => {
            pw.destroy();
            resolve(username);
        });
    });
};