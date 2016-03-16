"use strict";

import ui =  require("sdk/ui");
import selfModule =  require("sdk/self");
import tabs = require("sdk/tabs");
import system = require("sdk/system");
import timersModule = require("sdk/timers");
import windowsModule = require('sdk/windows');
import urlModule = require('sdk/url');

import prefModule = require('sdk/simple-prefs');
import lowLevelPrefs = require('sdk/preferences/service');

import requestToken = require('./requestToken');
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getReadyForTwitterProfilePages = require('./getReadyForTwitterProfilePages');
import makeSigninPanel = require('./makeSigninPanel');
import TwitterAPIViaServer = require('./TwitterAPIViaServer');


const data = selfModule.data;
const setTimeout = timersModule.setTimeout;
const staticArgs = system.staticArgs;
const prefs = prefModule.prefs;
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
    let twitterCallbackURL = twitterAssistantServerOrigin+'/twitter/callback';

    function validateOauthToken(oauthToken){
        console.log('oauthToken', oauthToken)
        const twitterAPI = TwitterAPIViaServer(oauthToken, twitterAssistantServerOrigin);

        return twitterAPI.verifyCredentials()
        .then(user => {
            signinPanel.port.emit('logged-in-user', user);
            tabs.open('https://twitter.com/'+user.screen_name);

            throw new Error('TODO Save token');
        })
        .then( () => oauthToken )
        .catch(err => throw new Error('removing this token from storage if invalid'));
    }


    signinPanel.port.on('sign-in-with-twitter', () => {
        console.log('receiving sign-in-with-twitter');
        
        const oauthTokenP = requestToken(twitterAssistantServerOrigin, twitterCallbackURL)
        .then(twitterPermissionURL => {
            const twitterSigninWindow = windows.open(twitterPermissionURL);
            
            return new Promise(resolve => {
                twitterSigninWindow.on('open', w => {
                    const tab = w.tabs.activeTab;
                    tab.on('ready', t => {
                        if(t.url.startsWith(twitterCallbackURL)){
                            const parsedURL = URL(t.url);
                            const search = parsedURL.search;
                            const query = new Map<string, string>();

                            search.slice(1).split('&')
                                .forEach(p => {
                                    const x = p.split('=');
                                    query.set(x[0], x[1]);
                                });
                            w.close();
                            resolve(query.get('oauth_token'));
                        }

                    });
                })
            })
        });
        
        oauthTokenP
        .catch(e => {
            console.error('oauthTokenP.catch', e)
            signinPanel.port.emit(
                'error-request-token',
                {twitterAssistantServerOrigin: twitterAssistantServerOrigin, message: String(e)}
            );
        });
        
        oauthTokenP
        .then(validateOauthToken)
        .then(oauthToken => getReadyForTwitterProfilePages(oauthToken, twitterAssistantServerOrigin))
        .catch(err => console.error('error verifying the token', err));
    });

    throw new Error('TODO get token from storage, test it. show panel if none or invalid ')
    // In Server Phase I, always show the panel at startup since the addon has no memory
    signinPanel.show({position: twitterAssistantButton});
    throw 'TODO';

};
