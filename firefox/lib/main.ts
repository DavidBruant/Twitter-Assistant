"use strict";

import ui =  require("sdk/ui");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import system = require("sdk/system");
import timersModule = require("sdk/timers");

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');
import storageModule = require("sdk/simple-storage");

import requestToken = require('./requestToken');
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');
import makeSigninPanel = require('./makeSigninPanel');


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
    // https://twitter.com/dupatron has no tweets at this point 
];

/*throw 'Apparently retweet details are broken + Need to test whether addon user infos are properly fetched, then propagated to the tweetMine to compute the number nia nia nia + Make sure the "no logged in addon user" case is taken care of + add trim_user everywhere';*/

/*
setTimeout(() => { 
    TWITTER_USER_PAGES.forEach(url => tabs.open(url));
}, 3*1000);
*/

declare var process: any;

export var main = function(){
    
    prefs["sdk.console.logLevel"] = 'all';

    const signinPanel = makeSigninPanel();
    
    const twitterAssistantButton = new ui.ActionButton({
        id: "twitter-assistant-signin-panel-button",
        label: "Twitter Assistant panel",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: state => {
            signinPanel.show({position: twitterAssistantButton});
        }
    });
    
    guessAddonUserTwitterName()
    .then(username => {
        signinPanel.port.emit('update-logged-user', username);
    });

    signinPanel.show({position: twitterAssistantButton});

    requestToken('http://localhost:3737', 'http://localhost:3737/abcde')
};
