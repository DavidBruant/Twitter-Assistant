/// <reference path="../../../node_modules/typescript/lib/lib.es6.d.ts" />
/// <reference path="../../defs/ES6.d.ts" />
/// <reference path="../../defs/react-0.11.d.ts" />
/// <reference path="../../defs/TwitterAPI.d.ts" />
/// <reference path="../../defs/jetpack/jetpack-port.d.ts" />
/// <reference path="../../defs/TA-extensions.d.ts" />

// declare var React : React.Exports;
'use strict';

declare var self : {
    // TODO document event interface
    port: JetpackPort
}


import TwitterAssistant = require('./components/TwitterAssistant');
import TweetList = require('./components/TweetList');
import TweetMine = require('./TweetMine');
import stemByLang = require('./stem');

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
    twitterAssistantContainer.classList.add('TA-main-container');
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



/*
    various pieces of state
*/

function askUsers(userIds : TwitterUserId[]){
    self.port.emit('ask-users', userIds);
}

let users = new Map<TwitterUserId, TwitterAPIUser>(); 
let timeline : TwitterAPITweet[] = [];
let visitedUser : TwitterAPIUser;
let addonUserAndFriends : {
    user: TwitterAPIUser
    friendIds: Set<TwitterUserId>
};
let displayDayCount = 30; // give a value by default to get started
let languages: Map<string, {code: string, name: string}>; // give a value by default to get started

/* tweets list*/
const tweetListContainer: HTMLElement = document.createElement('div');
tweetListContainer.classList.add('TA-tweets-list');

let tweetListState: {
    title: string
    tweets: TwitterAPITweet[]
};

tweetListContainer.addEventListener('click', e => {
    if(!(<any>e.target).matches('.TA-tweets-list .timeline *')){
        tweetListContainer.remove();
        tweetListState = undefined;
    }
});

function renderTweetList(){ 
    if(!tweetListState)
        return;
    
    document.body.appendChild(tweetListContainer);
    React.renderComponent(
        TweetList(Object.assign({askUsers: askUsers, users: users}, tweetListState)), 
        tweetListContainer
    )
}



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
                addonUserAndFriends ? addonUserAndFriends.friendIds : undefined,
                languages
            ),
            displayDayCount : displayDayCount,
            users: users,
            askUsers: askUsers,
            addonUserAlreadyFollowingVisitedUser: addonUserAlreadyFollowingVisitedUser,
            visitedUserIsAddonUser: visitedUserIsAddonUser,
            showTweetList: function(tweets: TwitterAPITweet[], title: string){
                tweetListState = {
                    tweets: tweets,
                    title: title
                };
                renderTweetList();
            }
        }), twitterAssistantContainer);
        
        renderTweetList();
        
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
    users.set(visitedUser.id_str, visitedUser);

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

function matchTwitterLanguagesAndSupportedLanguages(languages: {code: string, name: string}[]){
    languages.forEach(({code, name}) => {
        if(!stemByLang.has(code)){
            console.warn('language', code, name, 'not supported by Twitter Assistant');
        }
    });
}

/*self.port.on('languages', (_languages: {code: string, name: string}[]) => {
    console.log('content-side languages', languages);
    languages = new Map<string, {code: string, name: string}>();
    
    _languages.forEach(l => languages.set(l.code, l)); 
    
    updateTwitterAssistant();
    
    // do the matching in the content process because of build-time constraints. 
    // TODO move this at the addon level and do it only once (not once per tab)
    matchTwitterLanguagesAndSupportedLanguages(_languages); 
});*/

// Initial "empty" rendering ASAP so the user knows Twitter Assistant exists
updateTwitterAssistant();
