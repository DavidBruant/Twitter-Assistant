"use strict";

const ui =  require("sdk/ui");
const Panel =  require("sdk/panel").Panel;
const {data} =  require("sdk/self");
const tabs = require("sdk/tabs");
const system = require("sdk/system");
const {setTimeout} = require("sdk/timers");
const staticArgs = system.staticArgs;

const prefs = require('sdk/simple-prefs').prefs;
const lowLevelPrefs = require('sdk/preferences/service');
const storage = require("sdk/simple-storage").storage;

const getAccessToken = require('./getAccessToken.js');
const createTwitterApp = require('./createTwitterApp.js');
const retriveDevTwitterUserCredentials = require('./retrieveDevTwitterUserCredentials.js');
const guessTwitterHandle = require('./guessTwitterHandle.js');
const getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages.js')


const TWITTER_MAIN_PAGE = "https://twitter.com";
const TWITTER_USER_PAGES = [
    "https://twitter.com/DavidBruant"/*,
    "https://twitter.com/rauschma",
    "https://twitter.com/nitot",
    "https://twitter.com/guillaumemasson",
    "https://twitter.com/angustweets"*/
];

// throw 'add "if you are already logged in click here"';


exports.main = function(){
    
    /*
        SETUP
    */
    
    // browser toolbox for debugging
    if(staticArgs['browser-toolbox']){
        lowLevelPrefs.set("devtools.chrome.enabled", true);
        lowLevelPrefs.set("devtools.debugger.remote-enabled", true);
    }
    
    prefs["sdk.console.logLevel"] = 'all';
    
    
    
    /*
        ACTUAL MAIN
    */
    
    let storedTwitterAPICredentials = storage.credentials ? JSON.parse(storage.credentials) : {};
    
    // use the values passed as static args in priority;
    let key = staticArgs['CONSUMER_KEY'] || storedTwitterAPICredentials.key;
    let secret = staticArgs['CONSUMER_SECRET'] || storedTwitterAPICredentials.secret;

    if(staticArgs['CONSUMER_KEY'] && staticArgs['CONSUMER_SECRET']){
        setTimeout(function(){
            for(let url of TWITTER_USER_PAGES)
                tabs.open(url);
        }, 3*1000);
    }
    
    // button
    const twitterAssistantButton = ui.ActionButton({
        id: "twitter-assistant-credentials-panel-button",
        label: "Twitter Assistant panel",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            credentialsPanel.show({position: twitterAssistantButton});
        }
    });
    
    // credentials panel
    const credentialsPanel = Panel({
        width: 650,
        height: 400, 
        contentURL: data.url('panel/mainPanel.html')
    });
    
    credentialsPanel.on('show', e => {
        console.log("credentialsPanel.on 'show'")
        
        guessTwitterHandle()
            .then(username => {
                console.log('guessed user', username);
                credentialsPanel.port.emit('update-logged-user', username);
            })
            .catch(err => {
                console.log('err guessed user', err);
                credentialsPanel.port.emit('update-logged-user', undefined);
            });
    })
    
    credentialsPanel.port.on('test-credentials', credentials => {
        console.log('test-credentials', credentials);
        
        getAccessToken(credentials.key, credentials.secret)
            .then(token => {
                credentialsPanel.port.emit('working-app-credentials', credentials);
            
                storage.credentials = JSON.stringify(credentials);
                setTimeout(() => credentialsPanel.hide(), 5*1000);
        
                getReadyForTwitterProfilePages(credentials);
            })
            .catch(err => {
                credentialsPanel.port.emit('non-working-app-credentials', {error: err, credentials: credentials});
            });
    });
    
    
    credentialsPanel.port.on('automate-twitter-app-creation', () => {
        
        console.time('app creation');
        
        guessTwitterHandle()
            .then(username => {
                createTwitterApp(username)
                    .then(twitterAppCredentials => {
                        console.timeEnd('app creation');

                        console.log('twitterAppCredentials', twitterAppCredentials);
                    
                        credentialsPanel.port.emit('working-app-credentials', twitterAppCredentials);
                    
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
    
    
    if(key && secret){
        getReadyForTwitterProfilePages({key:key, secret:secret});
        
        credentialsPanel.port.emit('working-app-credentials', {key: key, secret: secret});
    }
    else{ // no credentials stored. Ask some to the user
        console.time('guess');
        guessTwitterHandle().then(username => {
            console.timeEnd('guess');
            
            credentialsPanel.port.emit('update-logged-user', username);
        });
        
        credentialsPanel.show({position: twitterAssistantButton});
    }
    
};


