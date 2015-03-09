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

var ONE_DAY = 24*60*60*1000; // ms
var RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

var twitterAssistantContainerP = <Promise<HTMLElement>> (new Promise<Document>( resolve => {
    document.addEventListener('DOMContentLoaded', function listener(){
        resolve(document);
        document.removeEventListener('DOMContentLoaded', listener);
    });
})).then(document => {
    var rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
    if(!rightProfileSidebar){
        var msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
        throw new Error(msg);
    }

    var twitterAssistantContainer = document.createElement('div');
    twitterAssistantContainer.classList.add('twitter-assistant-container');
    rightProfileSidebar.insertBefore(twitterAssistantContainer, rightProfileSidebar.firstChild);

    return twitterAssistantContainer;
})

twitterAssistantContainerP.catch(err => {
    console.error('twitterAssistantContainerP error', String(err));
});

var users = new Map<TwitterUserId, TwitterAPIUser>();
var timeline : TwitterAPITweet[] = [];
var visitedUser : TwitterAPIUser;
var addonUserAndFriends : {
    user: TwitterAPIUser
    friendIds: Set<TwitterUserId>
};

function updateTwitterAssistant(){
    return twitterAssistantContainerP.then(twitterAssistantContainer => {
        React.renderComponent(TwitterAssistant({
            /*
                tweets: TwitterAPITweet[], 
                visitedUserId: TwitterUserId, 
                addonUserId: TwitterUserId, 
                addonUserFriendIds: Set<TwitterUserId>
            */
            tweetMine: TweetMine(
                timeline,
                visitedUser ? visitedUser.id_str : undefined,
                addonUserAndFriends ? addonUserAndFriends.user.id_str : undefined,
                addonUserAndFriends ? addonUserAndFriends.friendIds : undefined
            ),
            users: users,
            visitedUser: visitedUser,
            askUsers: function askUsers(userIds : TwitterUserId[]){
                self.port.emit('ask-users', userIds);
            }
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
    addonUserAndFriends = {
        user: _addonUserAndFriends.user,
        friendIds: new (<any>Set)(_addonUserAndFriends.friendIds)
    }

    updateTwitterAssistant();
});

self.port.on('twitter-user-data', partialTimeline => {
    timeline = timeline.concat(partialTimeline);

    updateTwitterAssistant();
});


// Initial "empty" rendering ASAP so the user knows Twitter Assistant exists
updateTwitterAssistant();
