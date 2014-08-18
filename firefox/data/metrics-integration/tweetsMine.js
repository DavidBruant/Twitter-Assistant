"use strict";

const ONE_DAY = 24*60*60*1000;

/*
 @arg tweets : as received by the homeline API
*/
function makeTweetMine(tweets, username){
    console.log('tweetMine', tweets);
    return {
        append: function(otherTweets){
            Array.prototype.push.apply(tweets, otherTweets);
            // maybe sort tweets by creation date?
        },
        
        tweetMine: {
            // from and to are UNIX timestamps (number of ms since Jan 1st 1970)
            byDateRange: function(from, to){
                if(!from || !to)
                    throw new TypeError('need 2 args');
                
                return tweets.filter( t => {
                    const createdTimestamp = (new Date(t.created_at)).getTime();
                    return createdTimestamp >= from && createdTimestamp < to;
                });
            },
            getRetweets: function(){
                //console.log('getRetweets', tweets);
                
                return tweets.filter(function(tweet){
                    return 'retweeted_status' in tweet;
                });
            },
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
                return tweets.filter(tweet => {
                    return tweet.user.screen_name === username &&
                        !tweet.retweeted_status &&
                        tweet.text.startsWith('@'); // a bit weak, but close enough. Would need to check if the user actually exists
                });
            },
            getOldestTweet: function(){
                // not guaranteed the tweets are sent in DESC created_at order https://twitter.com/DavidBruant/status/477475344161980417
                return tweets.reduce(function(oldestSoFar, curr){
                    const oldestSoFarTimestamp = (new Date(oldestSoFar.created_at)).getTime();
                    const currTimestamp = (new Date(curr.created_at)).getTime();

                    return oldestSoFarTimestamp < currTimestamp ? oldestSoFar : curr;
                });
            },
            
            getOwnTweets: function(){
                return tweets.filter(tweet => !('retweeted_status' in tweet));
            },
            
            getGeneratedRetweetsCount: function(){
                return this.getOwnTweets()
                    .map(tweet => tweet.retweet_count)
                    .reduce(function(acc, rtCount){
                        return acc + rtCount;
                    });
            },
            getGeneratedFavoritesCount: function(){
                return this.getOwnTweets()
                    .map(tweet => tweet.favorite_count)
                    .reduce(function(acc, favCount){
                        return acc + favCount;
                    });
            },
            get length(){
                return tweets.length;
            }   
        }
    }
}

