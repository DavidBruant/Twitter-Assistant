"use strict";

import panelModule =  require("sdk/panel");
import selfModule =  require("sdk/self");

import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');

const Panel = panelModule.Panel;
const data = selfModule.data;

function makeSigninPanel(){

    const signinPanel = new Panel({
        width: 650,
        height: 400, 
        contentURL: data.url('panel/mainPanel.html')
    });
    
    /*signinPanel.on('show', e => {
        console.log("signinPanel.on 'show'")
        
        guessAddonUserTwitterName()
            .then(username => {
                console.log('guessed user', username);
                signinPanel.port.emit('update-logged-user', username);
            })
            .catch(err => {
                console.log('err guessed user', err);
                signinPanel.port.emit('update-logged-user', undefined);
            });
    })*/
    
    return signinPanel;
}

export = makeSigninPanel;