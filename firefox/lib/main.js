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
    
    // token panel
    const tokenPanel = Panel({
        width: 650,
        height: 170, 
        contentURL: data.url('token.html'),
        
        contentScriptFile: data.url('token.js'),
        contentScriptWhen: "ready"
    });
    
    tokenPanel.port.on('test-credentials', credentials => {
        console.log('test-credentials', credentials);
        
        getAccessToken(credentials.key, credentials.secret)
            .then(token => {
                tokenPanel.port.emit('test-credentials-result', credentials);
            })
            .catch(err => {
                tokenPanel.port.emit('test-credentials-result', err);
            });
    });
    
    tokenPanel.port.on('persist-credentials', credentials => {
        storage.credentials = JSON.stringify(credentials);
        tokenPanel.hide();
        
        getAccessToken(credentials.key, credentials.secret)
            .then(TwitterAPI)
            .then(getReadyForTwitterProfilePages)
    });
    
    const twitterAssistantButton = ui.ActionButton({
        id: "glovesmore",
        label: "Enter oauth Twitter tokens",
        icon: data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            tokenPanel.show({position: twitterAssistantButton});
            
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
            contentScriptWhen: "start", // mostly so the attach event happens as soon as possible

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

                var RTs = timeline.filter(function(tweet){
                    return 'retweeted_status' in tweet;
                });

                var tweetsWithLink = timeline.filter(tweet => {
                    try{
                        return tweet.entities.urls.length >= 1;
                    }
                    catch(e){
                        // most likely a nested property doesn't exist
                        return false;
                    }
                });


                worker.port.emit('twitter-user-stats', {
                    tweetsConsidered: timeline.length,
                    retweetsCount: RTs.length,
                    tweetsWithLinkCount: tweetsWithLink.length
                });

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
    else{ // no token stored. Ask one to user
        tokenPanel.show({position: twitterAssistantButton});
    }
    
};

