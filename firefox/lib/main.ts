"use strict";

import ui =  require("sdk/ui");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import system = require("sdk/system");
import timersModule = require("sdk/timers");
import windowsModule = require('sdk/windows');

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');
import storageModule = require("sdk/simple-storage");

import requestToken = require('./requestToken');
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');
import makeSigninPanel = require('./makeSigninPanel');


const data = selfModule.data;
const setTimeout = timersModule.setTimeout;
const staticArgs = system.staticArgs;
const prefs = prefModule.prefs;
const storage = storageModule.storage;
const windows = windowsModule.browserWindows;

const TWITTER_MAIN_PAGE = "https://twitter.com";
const TWITTER_USER_PAGES = [
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
    When the user clicks on the button in the panel:
    * panel asks addon
    * addon reaches server
    * server returns redirectURL
    * panel does window.open(redirectURL);

*/


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
    .then(username => { signinPanel.port.emit('update-logged-user', username); });

    signinPanel.show({position: twitterAssistantButton});

    signinPanel.port.on('sign-in-with-twitter', () => {
        console.log('receiving sign-in-with-twitter');
        requestToken('http://localhost:3737', 'http://127.0.0.1:3737/twitter/callback')
        .then(twitterPermissionURL => {
            signinPanel.port.emit('sign-in-with-twitter-redirect-url', twitterPermissionURL);
        })
        .catch(e => console.error('requestToken', e));
    })



    
};
