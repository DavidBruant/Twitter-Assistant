"use strict";

import ui =  require('sdk/ui');
import selfModule =  require('sdk/self');
import tabs = require('sdk/tabs');
import system = require('sdk/system');
import timersModule = require('sdk/timers');
import windowsModule = require('sdk/windows');
import urlModule = require('sdk/url');

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');

import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');
import makeSigninPanel = require('./makeSigninPanel');
import TwitterAPIViaServer = require('./TwitterAPIViaServer');
import askUserTwitterPermissions = require('./askUserTwitterPermissions')

const data = selfModule.data;
const setTimeout = timersModule.setTimeout;
const staticArgs = system.staticArgs;
const prefs : any = prefModule.prefs;
const windows = windowsModule.browserWindows;
const URL = urlModule.URL;

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

const OAUTH_TOKEN_PREF = "oauthtoken";

function rememberOauth(value?){
    if(value ===  undefined){
        return prefs[OAUTH_TOKEN_PREF];
    }
    
    if(Object(value) === value){
        prefs[OAUTH_TOKEN_PREF] = JSON.stringify(value);
        return;
    }

    if(typeof value === 'string'){
        prefs[OAUTH_TOKEN_PREF] = value;
        return;
    }

    throw new TypeError('No idea what to do with a '+typeof value+' value');
}


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
    
    let twitterAssistantServerOrigin = 'http://92.243.26.40:3737';
    

    function requestUserForTwitterSignin(getTwitterAuthenticateAndCallbackURLs){
        return new Promise(resolve => {
            signinPanel.show({position: twitterAssistantButton});

            signinPanel.port.once('sign-in-with-twitter', () => {
                console.log('receiving sign-in-with-twitter');

                return getTwitterAuthenticateAndCallbackURLs()
                .then(askUserTwitterPermissions);
                
                
                /*
                const oauthP = 
                
                userLoggedInToTwitterAPIP
                .catch(e => {
                    console.error('twitterAuthenticateURLP.catch', e)
                    signinPanel.port.emit(
                        'error-request-token',
                        {twitterAssistantServerOrigin: twitterAssistantServerOrigin, message: String(e)}
                    );
                });
                
                userLoggedInToTwitterAPIP.then(


                )
                const userP = twitterAPI.verifyCredentials()
                .then(user => {
                    signinPanel.port.emit('logged-in-user', user);
                    tabs.open('https://twitter.com/'+user.screen_name);
                })
                .catch(err => console.error('error verifying the token', err));
                */
            }); 
        })
        
        

    }

    let twitterAPI = TwitterAPIViaServer(rememberOauth, requestUserForTwitterSignin, twitterAssistantServerOrigin);
            
    signinPanel.port.on('sign-in-with-twitter', () => {
        console.log('receiving sign-in-with-twitter');

        throw 'TODO - reinit the existing twitterAPI';
    });

    /*
        init
    */
    const savedToken = rememberOauth(); 
    
    if(savedToken){
        
        validateOauthToken(savedToken)
        .catch(err => {
            // pref contains an invalid token
            prefs[OAUTH_TOKEN_PREF] = '';
            signinPanel.show({position: twitterAssistantButton})
            throw err;
        })
        .then(tokenAndUser => {
            getReadyForTwitterProfilePages(tokenAndUser.oauthToken, twitterAssistantServerOrigin);
            signinPanel.port.emit('logged-in-user', tokenAndUser.user);
        })
    }
    else{
        signinPanel.show({position: twitterAssistantButton})
    }

};
