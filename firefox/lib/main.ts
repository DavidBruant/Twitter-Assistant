"use strict";

import ui =  require("sdk/ui");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import system = require("sdk/system");
import timersModule = require("sdk/timers");

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');
import storageModule = require("sdk/simple-storage");

import getAccessToken = require('./getAccessToken');
import guessTwitterHandle = require('./guessTwitterHandle');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');
import makeCredentialsPanel = require('./makeCredentialsPanel');


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

    // https://twitter.com/BuzzFeed // for an account with LOTS of tweets
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
    
    var credentialsPanel = makeCredentialsPanel();
    
    // button
    var twitterAssistantButton = new ui.ActionButton({
        id: "twitter-assistant-credentials-panel-button",
        label: "Twitter Assistant panel",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            credentialsPanel.show({position: twitterAssistantButton});
        }
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


