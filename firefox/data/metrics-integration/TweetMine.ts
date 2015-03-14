"use strict";

import getRetweetOriginalTweet = require('./getRetweetOriginalTweet');
import getWhosBeingConversedWith = require('./getWhosBeingConversedWith');

const ONE_DAY = 24*60*60*1000; // ms


function isRetweet(t: TwitterAPITweet) : boolean{
    return 'retweeted_status' in t;
}


/*
 @args 
    tweets : as received by the homeline API
    visitedUsername : currently viewed user (screen_name)
*/
function TweetMine(
    tweets: TwitterAPITweet[],
    nbDays: number,
    visitedUserId: TwitterUserId, 
    addonUser: TwitterUserId, 
    addonUserFriendIds: Set<TwitterUserId>
    ){
    
    function isConversation(tweet: TwitterAPITweet) : boolean{
        return tweet.user.id_str === visitedUserId &&
            !tweet.retweeted_status &&
            tweet.text.startsWith('@') &&
            // if a user recently changed of screen_name, a tweet may start with @, but not
            // refer to an actual user. Testing if there is an entity to make sure.
            tweet.entities.user_mentions && tweet.entities.user_mentions.length >= 1; // a bit weak, but close enough. Would need to check if the user actually exists
    }
    
    function byDateRage(from: number, to: number){
        if(!from || !to)
            throw new TypeError('need 2 args');

        return tweets.filter( t => {
            var createdTimestamp = (new Date(t.created_at)).getTime();
            return createdTimestamp >= from && createdTimestamp < to;
        });
    }
    
    // remove all tweets that don't fit in the range
    var now = Date.now();
    var since = now - nbDays*ONE_DAY;
    
    tweets = byDateRage(since, now);
    
    
    return {
        // from and to are UNIX timestamps (number of ms since Jan 1st 1970)
        byDateRange: byDateRage,
        
        getRetweets: function(){
            return tweets.filter(isRetweet);
        },
        /*
            includes RTs and conversations
        */
        getTweetsWithLinks: function(){
            return tweets.filter(tweet => {
                try{
                    return tweet.entities.urls.length >= 1;
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
        },
        
        getConversations: function(){
            return tweets.filter(isConversation);
        },
        
        getNonRetweetNonConversationTweets: function(){
            // (<any>Set) until proper Set definition in TS 1.4
            var rts : Set<TwitterAPITweet> = new (<any>Set)(this.getRetweets());
            var convs : Set<TwitterAPITweet> = new (<any>Set)(this.getConversations());
            var ret : Set<TwitterAPITweet> = new (<any>Set)(tweets);
            
            rts.forEach(t => ret.delete(t));
            convs.forEach(t => ret.delete(t));
            
            return (<any>Array).from(ret);
        },
        
        getOldestTweet: function(){
            return tweets[tweets.length - 1]; // last
        },

        getOwnTweets: function() : TwitterAPITweet[] {
            return tweets.filter(tweet => !('retweeted_status' in tweet));
        },

        getGeneratedRetweetsCount: function(){
            return this.getOwnTweets()
                .map((tweet : TwitterAPITweet) => tweet.retweet_count)
                .reduce((acc: number, rtCount: number) => {return acc + rtCount}, 0);
        },
        getGeneratedFavoritesCount: function(){
            return this.getOwnTweets()
                .map((tweet : TwitterAPITweet) => tweet.favorite_count)
                .reduce((acc: number, favCount: number) => {return acc + favCount}, 0);
        },
        
        getTweetsThatWouldBeSeenIfAddonUserFollowedVisitedUser: function(){
            return tweets.filter(t => {
                const isRT = isRetweet(t);
                const isConv = isConversation(t);
                
                if(!isRT && !isConv)
                    return true;
                else{
                    if(!addonUserFriendIds){
                        return isRT || !isConv;
                    }
                    
                    return (isRT && !addonUserFriendIds.has(getRetweetOriginalTweet(t).user.id_str)) ||
                        (isConv && addonUserFriendIds.has( getWhosBeingConversedWith(t) ));
                }
            });
            
        },
        
        get length(){
            return tweets.length;
        }
    }
}

export = TweetMine;