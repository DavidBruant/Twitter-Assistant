'use strict';

/*
    if access to Twitter API, have a pagemod
    if no access to Twitter API, no need for a pagemod

*/

import pagemodModule = require("sdk/page-mod");
import selfModule =  require("sdk/self");


import getAccessToken = require('./getAccessToken');
import getTimelineOverATimePeriod = require('./getTimelineOverATimePeriod'); 
import TwitterAPI = require('./TwitterAPI');
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getAddonUserInfoAndFriends = require('./getAddonUserInfoAndFriends');

//import stemByLang = require('../data/metrics-integration/stem');


const PageMod = pagemodModule.PageMod;
const data = selfModule.data;



const ONE_DAY = 24*60*60*1000;
const DISPLAY_DAY_COUNT = 40;

var lastTwitterAPICredentials : OAuthCredentials;
var lastAccessToken : AccessToken;

var twitterAPI : TwitterAPI_I;

var addonUsername : string;
var addonUserAndFriendsP : Promise<{
    user: TwitterAPIUser
    friendIds: TwitterUserId[]
}>;

let languages: {code: string, name: string}[];


// create the pageMod inconditionally
// if the browser was offline initially, an access token couldn't be acquired
// the pageMod will verify if there is an access token at each attach event (and retry)
var twitterProfilePageMod = new PageMod({
    include: /^https?:\/\/twitter\.com\/([^\/]+)\/?$/,

    contentScriptFile: [
        data.url("ext/react.js"),
        
        data.url("metrics-integration/twitter-assistant-content.js")
    ],
    contentScriptWhen: "start", // mostly so the 'attach' event happens as soon as possible

    contentStyleFile: [
        data.url("metrics-integration/main.css"),
        data.url("metrics-integration/additional.css") 
    ]
});

twitterProfilePageMod.on('attach', function onAttach(worker){
    var matches = worker.url.match(/^https?:\/\/twitter\.com\/([^\/\?]+)[\/\?]?/);

    if(!Array.isArray(matches) || matches.length < 2)
        return;
    var visitedUser : string = matches[1];
    
    // now, variable user contains a screen_name
    //console.log('user', user);
    
    
    twitterAPI.lookupUsersByScreenNames([visitedUser]).then(users => {
        worker.port.emit('visited-user-details', users[0]);
    });
    
    getAddonUserInfoAndFriends(twitterAPI).then(function(result){
        worker.port.emit('addon-user-and-friends', result);
    });
    
    
    worker.port.emit('display-days-count', DISPLAY_DAY_COUNT);
    
    if(!lastAccessToken){
        getAccessToken(lastTwitterAPICredentials.key, lastTwitterAPICredentials.secret)
            .then((accessToken : AccessToken) => {
                lastAccessToken = accessToken;
                
                // retry now that we have a token (but only if the worker is relevant at all)
                if(worker.tab)
                    onAttach(worker); 
            })
    }
    else{
        var getTimelineWithProgress = getTimelineOverATimePeriod(lastAccessToken);
        var timelineComplete = getTimelineWithProgress({
            username: visitedUser,
            timestampFrom: (new Date()).getTime() - ONE_DAY*40
        }, sendTimelineToContent);
        
        (<any> timelineComplete).catch( (err: Error) => {
            // TODO consider invalidating lastAccessToken here
            console.error('error while getting the user timeline', visitedUser, err);
        });
        
        /*if(languages){
            worker.port.emit('languages', languages);
        }
        else{
            twitterAPI.getLanguages()
                .then(l => {
                    languages = l;
                    worker.port.emit('languages', languages);
                })
                .catch(err => console.error('Twitter languages error', err));
        }*/
    }
    
    function sendTimelineToContent(partialTimeline: TwitterAPITweet[]){
        worker.port.emit('twitter-user-data', partialTimeline);
    }
    
    worker.port.on('ask-users', (userIds: TwitterUserId[]) => {
        twitterAPI.lookupUsersByIds(userIds).then(users => {
            worker.port.emit('answer-users', users)
        });
    });
    
});

function getReady(twitterAPICredentials: OAuthCredentials) : Promise<any>{
    // save credentials for later in case we're not connected yet 
    lastTwitterAPICredentials = twitterAPICredentials;
    lastAccessToken = undefined; // forget previous token since it's likely not in sync with the new API credentials
    addonUserAndFriendsP = undefined;
    twitterAPI = undefined;
    
    var accessTokenP = getAccessToken(twitterAPICredentials.key, twitterAPICredentials.secret)
        .then(accessToken => {
            lastAccessToken = accessToken;
            twitterAPI = TwitterAPI(lastAccessToken);
            return accessToken;
        });
    
    var addonUsernameP = guessAddonUserTwitterName().then(username => {
        addonUsername = username;
    });
    
    // <any> so TS shut up
    return (<any>Promise).all([accessTokenP, addonUsernameP]);
}

export = getReady;