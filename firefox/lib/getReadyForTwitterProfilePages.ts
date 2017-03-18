'use strict';

import pagemodModule = require("sdk/page-mod");
import selfModule =  require("sdk/self");

import getTimelineOverATimePeriod = require('./getTimelineOverATimePeriod'); 
import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');
import getAddonUserInfoAndFriends = require('./getAddonUserInfoAndFriends');

//import stemByLang = require('../data/metrics-integration/stem');


const PageMod = pagemodModule.PageMod;
const data = selfModule.data;

const ONE_DAY = 24*60*60*1000;
const DISPLAY_DAY_COUNT = 40;

let twitterAPI : TwitterAPI_I;

/*let addonUsername : string;
let addonUserAndFriendsP : Promise<{
    user: TwitterAPIUser
    friendIds: TwitterUserId[]
}>;*/

let languages: {code: string, name: string}[];


// create the pageMod inconditionally
// if the browser was offline initially, an access token couldn't be acquired
// the pageMod will verify if there is an access token at each attach event (and retry)
const twitterProfilePageMod = new PageMod({
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
    // TODO:
    // Do nothing on 404 pages as well as search results
    
    const matches = worker.url.match(/^https?:\/\/twitter\.com\/([^\/\?]+)[\/\?]?/);
    
    if(!Array.isArray(matches) || matches.length < 2)
        return;
    const visitedUser : string = matches[1];
    
    
    twitterAPI.lookupUsersByScreenNames([visitedUser]).then( users => {
        worker.port.emit('visited-user-details', users[0]);
    });
    
    getAddonUserInfoAndFriends(twitterAPI).then( result => {
        worker.port.emit('addon-user-and-friends', result);
    });
    
    
    worker.port.emit('display-days-count', DISPLAY_DAY_COUNT);
    
    const getTimelineWithProgress = getTimelineOverATimePeriod(twitterAPI.getUserTimeline);
    const timelineComplete = getTimelineWithProgress({
        username: visitedUser,
        timestampFrom: (new Date()).getTime() - ONE_DAY*40
    }, sendTimelineToContent);

    (<any> timelineComplete).catch( (err: Error) => {
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
    
    function sendTimelineToContent(partialTimeline: TwitterAPITweet[]){
        worker.port.emit('twitter-user-data', partialTimeline);
    }
    
    worker.port.on('ask-users', (userIds: TwitterUserId[]) => {
        twitterAPI.lookupUsersByIds(userIds).then(users => {
            worker.port.emit('answer-users', users)
        });
    });
    
});

function getReady(_twitterAPI : TwitterAPI_I) : void{
    twitterAPI = _twitterAPI;
}

export = getReady;