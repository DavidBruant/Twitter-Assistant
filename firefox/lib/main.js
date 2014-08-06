"use strict";

const ui =  require("sdk/ui");
const Panel =  require("sdk/panel").Panel;
const data =  require("sdk/self").data;
const pageMod = require("sdk/page-mod");
const tabs = require("sdk/tabs");
const system = require("sdk/system");
const staticArgs = system.staticArgs;

const prefs = require('sdk/simple-prefs').prefs;
const lowLevelPrefs = require('sdk/preferences/service');
const storage = require("sdk/simple-storage").storage;

const getAccessToken = require('getAccessToken.js');
const TwitterAPI = require('TwitterAPI.js'); 
const createTwitterApp = require('createTwitterApp.js');
const retriveDevTwitterUserCredentials = require('retrieveDevTwitterUserCredentials');

const TWITTER_MAIN_PAGE = "https://twitter.com";
const TWITTER_USER_PAGES = [
    "https://twitter.com/DavidBruant",
    "https://twitter.com/oncletom",
    "https://twitter.com/supersole"
];

exports.main = function(){
    
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
    
    const storedCredentials = storage.credentials ? JSON.parse(storage.credentials) : {};
    
    // use the values passed as static args in priority;
    const key = staticArgs['CONSUMER_KEY'] || storedCredentials.key;
    const secret = staticArgs['CONSUMER_SECRET'] || storedCredentials.secret;
    
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
    
    credentialsPanel.port.on('persist-credentials', credentials => {
        console.log('persist-credentials', credentials);
        
        storage.credentials = JSON.stringify(credentials);
        credentialsPanel.hide();
        
        getAccessToken(credentials.key, credentials.secret)
            .then(TwitterAPI)
            .then(getReadyForTwitterProfilePages)
    });
    
    credentialsPanel.port.on('automate-twitter-app-creation', () => {
        let devTwitterUserCredentialsP; //= retriveDevTwitterUserCredentials();
        if(staticArgs['username'] && staticArgs['password']){
        
            console.time('app creation');
        
            createTwitterApp({
                username: staticArgs['username'],
                password: staticArgs['password']
            }).then(twitterAppCredentials => {
                console.log('twitterAppCredentials', twitterAppCredentials)
                console.timeEnd('app creation');
            })
        }
        else{
            throw new Error('no username/password combo. Need to write/fix code reading in stored passwords and handle no passwords at all')
        }
    
    });
    
    const twitterAssistantButton = ui.ActionButton({
        id: "twitter-assistant-credentials-panel-button",
        label: "Enter oauth Twitter tokens",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            credentialsPanel.show({position: twitterAssistantButton});
            
            // TODO when there are stored credentials, send them over
        }
    });
    
    
    var twitterProfilePageMod;
    
    function getReadyForTwitterProfilePages(twitterAPI){
        if(twitterProfilePageMod)
            twitterProfilePageMod.destroy();
        
        // Twitter pagemod
        twitterProfilePageMod = pageMod.PageMod({
            include: /^https?:\/\/twitter\.com\/([^\/]+)\/?$/,

            contentScriptFile: [
                data.url("tweetsMine.js"),
                data.url("metrics-integration.js")
            ],
            contentScriptWhen: "start", // mostly so the 'attach' event happens as soon as possible

            contentStyleFile: data.url("metrics-integration.css")
        });

        twitterProfilePageMod.on('attach',function(worker){
            var matches = worker.url.match(/^https?:\/\/twitter\.com\/([^\/]+)\/?$/);
            var user;

            if(!Array.isArray(matches) || matches.length < 2)
                return;

            user = matches[1];
            console.log('user', user);
            twitterAPI.getUserTimeline(user).then(function(timeline){
                console.log(timeline); 

                worker.port.emit('twitter-user-data', {
                    timeline: timeline,
                    user: user
                });

            }).catch( err => {
                console.error('error while getting the user timeline', user, err);
            });

        });
    }
    
    if(key && secret){
        // if the getAccessToken call fails (as it does when computer not logged in at Firefox startup), there is no way to recover an access token
        getAccessToken(key, secret)
            .then(TwitterAPI)
            .then(getReadyForTwitterProfilePages)
    }
    else{ // no credentials stored. Ask some to the user
        // TODO create the Panel lazily only in this branch
        credentialsPanel.show({position: twitterAssistantButton});
    }
    
};


