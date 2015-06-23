/// <reference path="../../../node_modules/typescript/bin/lib.es6.d.ts" />
/// <reference path="../../defs/ES6.d.ts" />
/// <reference path="../../defs/react-0.11.d.ts" />
/// <reference path="../../defs/TwitterAPI.d.ts" />
/// <reference path="../../defs/jetpack/jetpack-port.d.ts" />

// declare var React : React.Exports;
'use strict';

declare var self : {
    // TODO document event interface
    port: JetpackPort
}


import TwitterAssistant = require('./components/TwitterAssistant');
import TweetMine = require('./TweetMine');

const ONE_DAY = 24*60*60*1000; // ms

const RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .SidebarCommonModules';

const twitterAssistantContainerP : Promise<HTMLElement> = (new Promise<Document>( resolve => {
    document.addEventListener('DOMContentLoaded', function listener(){
        resolve(document);
        document.removeEventListener('DOMContentLoaded', listener);
    });
})).then(document => {
    // container on the twitter.com website
    let twitterContainer = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
    // container of the addon panel
    const twitterAssistantContainer = document.createElement('div');
    twitterAssistantContainer.classList.add('twitter-assistant-container');
    twitterAssistantContainer.classList.add('module'); // from Twitter CSS

    if(twitterContainer){
        twitterContainer.insertBefore(twitterAssistantContainer, twitterContainer.firstChild);
    }
    else{
        // sometimes, Twitter changes its HTML structure. Need to display things somewhere anyway.
        twitterContainer = document.body;
        twitterContainer.appendChild(twitterAssistantContainer);
    }


    return twitterAssistantContainer;
});

(<any> twitterAssistantContainerP).catch( (err: Error) => {
    console.error('twitterAssistantContainerP error', String(err));
});

let users = new Map<TwitterUserId, TwitterAPIUser>();
let timeline : TwitterAPITweet[] = [];
let visitedUser : TwitterAPIUser;
let addonUserAndFriends : {
    user: TwitterAPIUser
    friendIds: Set<TwitterUserId>
};
let displayDayCount = 30; // give a value by default to get started

function updateTwitterAssistant(){
    let addonUserAlreadyFollowingVisitedUser: boolean;
    let visitedUserIsAddonUser: boolean;
    if(addonUserAndFriends && visitedUser){
        addonUserAlreadyFollowingVisitedUser = addonUserAndFriends.friendIds.has(visitedUser.id_str);
        visitedUserIsAddonUser = addonUserAndFriends.user.id_str === visitedUser.id_str;
    }
    
    return twitterAssistantContainerP.then(twitterAssistantContainer => {
        React.renderComponent(TwitterAssistant({
            tweetMine: TweetMine(
                timeline,
                displayDayCount,
                visitedUser ? visitedUser.id_str : undefined,
                addonUserAndFriends ? addonUserAndFriends.user.id_str : undefined,
                addonUserAndFriends ? addonUserAndFriends.friendIds : undefined
            ),
            displayDayCount : displayDayCount,
            users: users,
            visitedUser: visitedUser,
            askUsers: function askUsers(userIds : TwitterUserId[]){
                self.port.emit('ask-users', userIds);
            },
            addonUserAlreadyFollowingVisitedUser: addonUserAlreadyFollowingVisitedUser,
            visitedUserIsAddonUser: visitedUserIsAddonUser
        }), twitterAssistantContainer);
    }).catch(function(err){
        console.error('metrics integration error', String(err));
        throw err;
    });
}

self.port.on('answer-users', (receivedUsers: TwitterAPIUser[]) => {
    receivedUsers.forEach(u => users.set(u.id_str, u));

    updateTwitterAssistant();
});

self.port.on('visited-user-details', u => {
    visitedUser = u;

    updateTwitterAssistant();
});

self.port.on('addon-user-and-friends', _addonUserAndFriends => {
    console.log("received addon user infos in content", _addonUserAndFriends);
    
    addonUserAndFriends = {
        user: <TwitterAPIUser>_addonUserAndFriends.user,
        friendIds: new Set<TwitterUserId>(_addonUserAndFriends.friendIds)
    }

    updateTwitterAssistant();
});

self.port.on('twitter-user-data', partialTimeline => {
    timeline = timeline.concat(partialTimeline);

    updateTwitterAssistant();
});

self.port.on('display-days-count', _displayDayCount => {
    displayDayCount = _displayDayCount;
    
    updateTwitterAssistant();
});

// Initial "empty" rendering ASAP so the user knows Twitter Assistant exists
updateTwitterAssistant();
