"use strict";

import ui =  require("sdk/ui");
import panelModule =  require("sdk/panel");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import system = require("sdk/system");
import timersModule = require("sdk/timers");

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');
import storageModule = require("sdk/simple-storage");

import getAccessToken = require('./getAccessToken');
import createTwitterApp = require('./createTwitterApp');
import guessTwitterHandle = require('./guessTwitterHandle');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages')


var Panel = panelModule.Panel;
var data = selfModule.data;
var setTimeout = timersModule.setTimeout;
var staticArgs = system.staticArgs;
var prefs = prefModule.prefs;
var storage = storageModule.storage;
    
    

var TWITTER_MAIN_PAGE = "https://twitter.com";
var TWITTER_USER_PAGES = [
    "https://twitter.com/DavidBruant"/*,
    "https://twitter.com/rauschma",
    "https://twitter.com/nitot",
    "https://twitter.com/guillaumemasson",
    "https://twitter.com/angustweets"*/
];

// throw 'add "if you are already logged in click here"';


export var main = function(){
    
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
    
    var storedTwitterAPICredentials = storage.credentials ? JSON.parse(storage.credentials) : {};
    
    // use the values passed as static args in priority;
    var key = staticArgs['CONSUMER_KEY'] || storedTwitterAPICredentials.key;
    var secret = staticArgs['CONSUMER_SECRET'] || storedTwitterAPICredentials.secret;

    if(staticArgs['CONSUMER_KEY'] && staticArgs['CONSUMER_SECRET']){
        setTimeout(function(){
            TWITTER_USER_PAGES.forEach(url => tabs.open(url));
        }, 3*1000);
    }
    
    // button
    var twitterAssistantButton = new ui.ActionButton({
        id: "twitter-assistant-credentials-panel-button",
        label: "Twitter Assistant panel",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            credentialsPanel.show({position: twitterAssistantButton});
        }
    });
    
    // credentials panel
    var credentialsPanel = new Panel({
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


