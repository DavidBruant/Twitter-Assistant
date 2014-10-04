(function(exports){
    'use strict';
    
    /*
        extract the the original tweet out of a retweet
    */
    function getOriginalTweet(rt){
        var ret = rt;
        
        while(Object(ret.retweeted_status) === ret.retweeted_status)
            ret = ret.retweeted_status;
        
        return ret;
    }
    
    exports.TimelineComposition = React.createClass({
        
        render: function(){
            /*
                {
                    tweetMine: TweetMine
                }
            */
            const data = this.props;
            
            const {tweetMine} = data;
            
            const writtenTweets = tweetMine.getNonRetweetNonConversationTweets();
            
            const tweetsWithLinks = writtenTweets.filter(t => {
                try{
                    return t.entities.urls.length >= 1;
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
            const linkPercent = tweetsWithLinks.length*100/tweetMine.length;
            let linkTweetSet = new Set(tweetsWithLinks);
            
            // if a tweet has both a link and a media, the link is prioritized
            const mediaTweets = writtenTweets.filter(t => {
                try{
                    return t.entities.media.length >= 1 && !linkTweetSet.has(t);
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
            linkTweetSet = undefined;
            const mediaPercent = mediaTweets.length*100/tweetMine.length;
            
            
            const retweets = tweetMine.getRetweets();
            const rtPercent = retweets.length*100/tweetMine.length;
            const convPercent = tweetMine.getConversations().length*100/tweetMine.length;
            
            const originalTweets = retweets.map(getOriginalTweet);
            const originalTweetsByAuthor = new Map();
            originalTweets.forEach(function(t){
                const userId = t.user.id_str;

                if(!originalTweetsByAuthor.has(userId)){
                    originalTweetsByAuthor.set(userId, {
                        count: 0,
                        user: t.user
                    });
                }

                originalTweetsByAuthor.get(userId).count++;
            });

            let sortedRetweetedUsers = [...originalTweetsByAuthor.values()]
                .sort((o1, o2) => o1.count < o2.count ? 1 : -1 );

            // keep only the first 10 for now
            sortedRetweetedUsers = sortedRetweetedUsers.slice(0, 10);
            
            const retweetDetails = sortedRetweetedUsers.map(({count, user}) => {
                return {
                    amount: count,
                    text: user.name,
                    url: "https://twitter.com/"+user.screen_name,
                    image: user.profile_image_url_https
                }
            });
            
            return React.DOM.div( {}, [
                Metrics({
                    values : [{
                        class: 'retweets',
                        title: "Retweets",
                        percent: rtPercent,
                        details: retweetDetails
                    }, {
                        class: 'conversations',
                        title: "Conversations",
                        percent: convPercent
                    }, {
                        class: 'media',
                        title: "Media",
                        percent: mediaPercent
                    }, {
                        class: 'links',
                        title: "Links",
                        percent: linkPercent
                    }, {
                        class: 'other',
                        title: "Other",
                        percent: 100 - (rtPercent + convPercent + mediaPercent + linkPercent)
                    }
                ]})
            ]);
        }
    });
        
})(this);
