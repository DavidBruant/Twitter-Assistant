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
    "https://twitter.com/DavidBruant",
    "https://twitter.com/oncletom",
    "https://twitter.com/supersole"
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
    
    // accelerate logging in
    if(staticArgs['username'] && staticArgs['password']){
        // open Twitter in a tab
        tabs.open({
            url: TWITTER_MAIN_PAGE,
            onOpen: function(twitterLoginTab){
                twitterLoginTab.once('ready', function(){
                    const worker = twitterLoginTab.attach({
                        contentScriptFile : data.url('dev/twitter-login.js')
                    });
                    worker.port.emit('twitter-credentials', {
                        username: staticArgs['username'], 
                        password: staticArgs['password']
                    });
                    
                    // when we navigate away from the Twitter main page (hopefully because of being properly logged in)
                    worker.once('detach', function(){
                        twitterLoginTab.once('ready', function(){
                            twitterLoginTab.close();
                            
                            // hopefully, we're properly logged in
                            /*TWITTER_USER_PAGES.forEach(url => {
                                tabs.open(url);
                            })*/
                            
                        });
                    })
                    
                });
            }
        });
    }
    
    prefs["sdk.console.logLevel"] = 'all';
    
    
    
    /*
        ACTUAL MAIN
    */
    
    let storedTwitterAPICredentials = storage.credentials ? JSON.parse(storage.credentials) : {};
    let storedTwitterUserCredentials; // in browser password manager
    
    // use the values passed as static args in priority;
    let key = staticArgs['CONSUMER_KEY'] || storedTwitterAPICredentials.key;
    let secret = staticArgs['CONSUMER_SECRET'] || storedTwitterAPICredentials.secret;

    
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
    
    credentialsPanel.port.on('automate-twitter-app-creation', twitterUserCredentials => {
        
        twitterUserCredentials = twitterUserCredentials || storedTwitterUserCredentials;
        if(!twitterUserCredentials){
            throw new Error('No stored credentials and none received from the panel form');
        }
        
        console.time('app creation');
        
        createTwitterApp(twitterUserCredentials)
            .then(twitterAppCredentials => {
                console.timeEnd('app creation');
                
                console.log('twitterAppCredentials', twitterAppCredentials);
                getReadyForTwitterProfilePages(twitterAppCredentials);
            })
            .catch( err => {
                console.error('twitterAppCredentials error', err);
            });
    
    });
    
    
    
    if(staticArgs['username'] && staticArgs['password']){
        storedTwitterUserCredentials = {
            username: staticArgs['username'],
            password: staticArgs['password']
        }
        credentialsPanel.port.emit('update-password-already-available');
    }
    
    
    if(key && secret){
        getReadyForTwitterProfilePages({key:key, secret:secret});
        
        //credentialsPanel.port.emit('update-API-credentials', {key: key, secret: secret});
    }
    else{ // no credentials stored. Ask some to the user
        console.time('guess');
        guessTwitterHandle().then(username => {
            console.timeEnd('guess');
            
            if(username){
                credentialsPanel.port.emit('update-username', username);
                retriveDevTwitterUserCredentials(username).then(credentials => {
                    if(credentials){
                        credentialsPanel.port.emit('update-password-already-available');
                        storedTwitterUserCredentials = credentials;
                    }    
                });
            }
        });
        
        credentialsPanel.show({position: twitterAssistantButton});
    }
    
};


