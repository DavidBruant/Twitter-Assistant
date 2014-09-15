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

/*
    TODO redo the main algorithm.
    
    if(storedTwitterAPICredentials available){
        don't show the panel, just get te access token and create the pageMod
    }
    else{
        show the panel
        guess the username
        if(username guessed){
            update panel
            try to find a password
            if(no corresponding password found){
                tell the panel about it
            }
        }
    }
*/

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
            TWITTER_USER_PAGES.forEach(function(url){
                tabs.open(url);
            })
        }, 3*1000);
    }
    
    // button
    const twitterAssistantButton = ui.ActionButton({
        id: "twitter-assistant-credentials-panel-button",
        label: "Enter oauth Twitter tokens",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            credentialsPanel.show({position: twitterAssistantButton});
        }
    });
    
    // credentials panel
    const credentialsPanel = Panel({
        width: 650,
        height: 400, 
        contentURL: data.url('credentialsPanel.html'),
        
        contentScriptFile: data.url('credentialsPanel.js'),
        contentScriptWhen: "ready",
        contentScriptOptions: (key && secret) ? 
            {key: key, secret: secret} : 
            undefined
    });
    
    credentialsPanel.port.on('test-credentials', credentials => {
        console.log('test-credentials', credentials);
        
        getAccessToken(credentials.key, credentials.secret)
            .then(token => {
                credentialsPanel.port.emit('test-credentials-result', credentials);
            })
            .catch(err => {
                credentialsPanel.port.emit('test-credentials-result', err);
            });
    });
    
    credentialsPanel.port.on('confirm-credentials', credentials => {
        console.log('confirm-credentials', credentials);
        
        storage.credentials = JSON.stringify(credentials);
        credentialsPanel.hide();
        
        getReadyForTwitterProfilePages(credentials);
    });
    
    credentialsPanel.port.on('automate-twitter-app-creation', () => {
        
        console.time('app creation');
        
        guessTwitterHandle()
            .then(username => {
                createTwitterApp(username)
                    .then(twitterAppCredentials => {
                        console.timeEnd('app creation');

                        console.log('twitterAppCredentials', twitterAppCredentials);
                        return getReadyForTwitterProfilePages(twitterAppCredentials).then(function(){
                            tabs.open('https://twitter.com/'+username);
                        });
                    })
                    .catch( err => {
                        console.error('createTwitterApp error', err);
                    });
            })
            .catch(err => {
                throw 'TODO tell the panel to inform the user that they MUST login to Twitter for the automated process to work';
            })
    
    });
    
    
    if(key && secret){
        getReadyForTwitterProfilePages({key:key, secret:secret});
        
        //credentialsPanel.port.emit('update-API-credentials', {key: key, secret: secret});
    }
    else{ // no credentials stored. Ask some to the user
        console.time('guess');
        guessTwitterHandle().then(username => {
            console.timeEnd('guess');
            
            credentialsPanel.port.emit('update-username', username);
        });
        
        credentialsPanel.show({position: twitterAssistantButton});
    }
    
};


