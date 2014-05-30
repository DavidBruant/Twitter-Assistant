"use strict";

const ui =  require("sdk/ui");
const Panel =  require("sdk/panel").Panel;
const data =  require("sdk/self").data;
const pageMod = require("sdk/page-mod");

const getAccessToken = require('getAccessToken.js');
const TwitterAPI = require('TwitterAPI.js'); 

const prefs = require('sdk/simple-prefs').prefs;

const storage = require("sdk/simple-storage").storage;

exports.main = function(){
    
    prefs["sdk.console.logLevel"] = 'all';
    
    // credentials panel
    const credentialsPanel = Panel({
        width: 650,
        height: 170, 
        contentURL: data.url('credentialsPanel.html'),
        
        contentScriptFile: data.url('credentialsPanel.js'),
        contentScriptWhen: "ready"
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
    
    const twitterAssistantButton = ui.ActionButton({
        id: "glovesmore",
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

            contentScriptFile: data.url("metrics-integration.js"),
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


                worker.port.emit('twitter-user-data', timeline);

            }).catch( err => {
                console.error('error while getting the user timeline', user, err);
            });

        });
    }
    
    if(storage.credentials){
        const creds = JSON.parse(storage.credentials);
        const key = creds.key,
              secret = creds.secret;
              
        getAccessToken(key, secret)
            .then(TwitterAPI)
            .then(getReadyForTwitterProfilePages)
    }
    else{ // no credentials stored. Ask some to the user
        // TODO create the Panel lazily only in this branch
        credentialsPanel.show({position: twitterAssistantButton});
    }
    
};


