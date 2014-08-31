'use strict';

const TwitterAPI = require('./TwitterAPI.js');

module.exports = function(accessToken){
    const twitterAPI = TwitterAPI(accessToken);
    
    var progressCount = 0;
    
    // should be one of these Stream+Promise hybrid when that's ready
    return function({username, timestampFrom, timestampTo}, progress){
        timestampTo = timestampTo || (new Date()).getTime()
        let accumulatedTweets = [];
        
        function accumulateTweets(timeline){
            // remove from timeline tweets that wouldn't be in the range
            const toAccumulate = timeline = timeline.filter(tweet => {
                const createdTimestamp = (new Date(tweet.created_at)).getTime();
                return createdTimestamp >= timestampFrom && createdTimestamp <= timestampTo;
            });
            
            accumulatedTweets = accumulatedTweets.concat(toAccumulate);
            
            return toAccumulate;
        }
        
        return twitterAPI.getUserTimeline(username).then(function processTweets(timeline){
            //console.log("processTweets", accumulatedTweets.length, timeline.length);
            
            // max_id dance may lead to re-feching one same tweet.
            if(accumulatedTweets.length > 0 && timeline[0].id_str === accumulatedTweets[accumulatedTweets.length-1].id_str)
                timeline = timeline.slice(1);
            var accumulated = accumulateTweets(timeline);
            
            //console.log("processTweets 2", accumulatedTweets.length, timeline.length, accumulated.length);
            
            // if tweets don't go back far enough, get max_id of last tweet and call twitterAPI.getUserTimeline again
            if(timeline.length === accumulated.length){
                var maxId = accumulatedTweets[accumulatedTweets.length - 1].id_str;
                progress(accumulatedTweets);
                progressCount++;
                return twitterAPI.getUserTimeline(username, maxId).then(processTweets);
            }
            else{
                console.log(username, progressCount);
                return accumulatedTweets;
            }
        });
    }
};