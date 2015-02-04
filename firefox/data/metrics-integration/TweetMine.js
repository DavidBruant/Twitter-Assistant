"use strict";
/*
 @arg tweets : as received by the homeline API
 username : currently viewed user (screen_name)
*/
function TweetMine(tweets, username) {
    return {
        // from and to are UNIX timestamps (number of ms since Jan 1st 1970)
        byDateRange: function (from, to) {
            if (!from || !to)
                throw new TypeError('need 2 args');
            return tweets.filter(function (t) {
                var createdTimestamp = (new Date(t.created_at)).getTime();
                return createdTimestamp >= from && createdTimestamp < to;
            });
        },
        getRetweets: function () {
            //console.log('getRetweets', tweets);
            return tweets.filter(function (tweet) {
                return 'retweeted_status' in tweet;
            });
        },
        /*
            includes RTs and conversations
        */
        getTweetsWithLinks: function () {
            return tweets.filter(function (tweet) {
                try {
                    return tweet.entities.urls.length >= 1;
                }
                catch (e) {
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
        },
        getConversations: function () {
            return tweets.filter(function (tweet) {
                return tweet.user.screen_name === username && !tweet.retweeted_status && tweet.text.startsWith('@') && tweet.entities.user_mentions && tweet.entities.user_mentions.length >= 1; // a bit weak, but close enough. Would need to check if the user actually exists
            });
        },
        getNonRetweetNonConversationTweets: function () {
            // (<any>Set) until proper Set definition in TS 1.4
            var rts = new Set(this.getRetweets());
            var convs = new Set(this.getConversations());
            var ret = new Set(tweets);
            rts.forEach(function (t) { return ret.delete(t); });
            convs.forEach(function (t) { return ret.delete(t); });
            return Array.from(ret);
        },
        getOldestTweet: function () {
            return tweets[tweets.length - 1]; // last
        },
        getOwnTweets: function () {
            return tweets.filter(function (tweet) { return !('retweeted_status' in tweet); });
        },
        getGeneratedRetweetsCount: function () {
            return this.getOwnTweets().map(function (tweet) { return tweet.retweet_count; }).reduce(function (acc, rtCount) {
                return acc + rtCount;
            }, 0);
        },
        getGeneratedFavoritesCount: function () {
            return this.getOwnTweets().map(function (tweet) { return tweet.favorite_count; }).reduce(function (acc, favCount) {
                return acc + favCount;
            }, 0);
        },
        get length() {
            return tweets.length;
        }
    };
}
module.exports = TweetMine;
//# sourceMappingURL=TweetMine.js.map