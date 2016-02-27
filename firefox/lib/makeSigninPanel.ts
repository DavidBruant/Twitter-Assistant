"use strict";

import panelModule =  require("sdk/panel");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import storageModule = require("sdk/simple-storage");

import createTwitterApp = require('./createTwitterApp');
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getAccessToken = require('./getAccessToken');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');

const Panel = panelModule.Panel;
const data = selfModule.data;
const storage = storageModule.storage;


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
    
    signinPanel.port.on('test-credentials', credentials => {
        console.log('test-credentials', credentials);
        
        getAccessToken(credentials.key, credentials.secret)
            .then(token => {
                signinPanel.port.emit('working-app-credentials', credentials);
            
                storage.credentials = JSON.stringify(credentials);
                setTimeout(() => signinPanel.hide(), 5*1000);
        
                getReadyForTwitterProfilePages(credentials);
            })
            .catch(err => {
                signinPanel.port.emit('non-working-app-credentials', {error: err, credentials: credentials});
            });
    });
    
    
    signinPanel.port.on('automate-twitter-app-creation', () => {
        
        console.time('app creation');
        
        guessAddonUserTwitterName()
            .then(username => {
                createTwitterApp(username)
                    .then(twitterAppCredentials => {
                        console.timeEnd('app creation');

                        console.log('twitterAppCredentials', twitterAppCredentials);
                    
                        signinPanel.port.emit('working-app-credentials', twitterAppCredentials);
                    
                        return getReadyForTwitterProfilePages(twitterAppCredentials).then(function(){
                            tabs.open('https://twitter.com/'+username);
                        });
                    })
                    .catch( err => {
                        console.error('createTwitterApp error', err);
                    });
            })
            .catch(err => {
                throw 'TODO tell the panel to inform the user that they MUST be connected to the Internet and login to Twitter for the automated process to work';
            })
    
    });
    
    return signinPanel;
}

export = makeSigninPanel;