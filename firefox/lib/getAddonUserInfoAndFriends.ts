"use strict";

import guessAddonUserTwitterName = require('./guessAddonUserTwitterName');

interface UserInfoAndFriends{ 
    user: TwitterAPIUser; 
    friendIds: TwitterUserId[]
}

var cachedUserName: string;
var cachedUserInfoAndFriends : UserInfoAndFriends;
var lastUserInfoFetchTimestamp = -Infinity;
var lastAddonUserTwitterNameGuessTimestamp = -Infinity;

var USER_INFO_VALIDITY = 2*60*60*1000; // ms

// For the time of this duration, let's assume the user hasn't logged out
var ASSUME_SAME_USER_DURATION = 15*60*1000;

function cacheAndReturn(userInfoAndFriends: UserInfoAndFriends){
    cachedUserName = userInfoAndFriends.user.screen_name;
    cachedUserInfoAndFriends = userInfoAndFriends;
    lastUserInfoFetchTimestamp = Date.now();
    return userInfoAndFriends;
}

function getAddonUserInfoAndFriends(twitterAPI: TwitterAPI_I) : Promise<UserInfoAndFriends> {
    var guessedUser : Promise<string>;   
    
    function getUserAndFriendsFromUsername(username: string){
        return twitterAPI.lookupUsersByScreenNames([username]).then(function(users){
            var user = users[0];
            return twitterAPI.getFriends(user.id_str).then(function(result){
                return {
                    user: user,
                    friendIds: result.ids
                };
            })
        })
    }
    

    if(Date.now() - lastAddonUserTwitterNameGuessTimestamp < ASSUME_SAME_USER_DURATION){
        guessedUser = Promise.resolve(cachedUserName);
    }
    else{
        guessedUser = guessAddonUserTwitterName().then(username => {
            lastAddonUserTwitterNameGuessTimestamp = Date.now();
            return username;
        })
    }

    return guessedUser.then(function(username){
        
        if(username){ // addon user logged in to Twitter
            if(username === cachedUserName){
                if(Date.now() - lastUserInfoFetchTimestamp < USER_INFO_VALIDITY)
                    return Promise.resolve(cachedUserInfoAndFriends);
                else
                    return getUserAndFriendsFromUsername(username).then(cacheAndReturn);
            }
            else
                return getUserAndFriendsFromUsername(username).then(cacheAndReturn);
        }
        else{ // not logged in
            // respectfully clearing cache
            cachedUserName = undefined;
            cachedUserInfoAndFriends = undefined;
            
            return undefined;
        }
        
    });
}

export = getAddonUserInfoAndFriends;