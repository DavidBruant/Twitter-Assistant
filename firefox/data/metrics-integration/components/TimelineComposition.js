(function(exports){
    'use strict';
    
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
            
            
            
            const rtPercent = tweetMine.getRetweets().length*100/tweetMine.length;
            const convPercent = tweetMine.getConversations().length*100/tweetMine.length;
            
            return React.DOM.div( {className: "all-metrics"}, [
                Metrics({
                    name: 'Tweet type',
                    values : [{
                            class: 'retweets',
                            title: "Retweets",
                            percent: rtPercent
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
                    ]
                })
            ]);
        }
    });
        
})(this);
