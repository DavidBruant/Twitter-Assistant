// Assumes React is loaded

// Assumes TwitterAssistantMainInfo component
// Assumes Histogram component
// Assumes TimelineComposition component
// Assumes HumansAreNotMetricsReminder component

(function(exports){
    'use strict';

    const HISTOGRAM_SIZE = 30;
    
    exports.TwitterAssistant = React.createClass({
        /*
            {
                tweetMine: TweetMine,
                users: TwitterAPIUser[],
                askUsers : usersId[] => void
            }
        */
        render: function(){
            const data = this.props, // TweetMine instance
                state = this.state;
            
            const {tweetMine, users, askUsers} = data;
            
            if(tweetMine.length === 0){
                return React.DOM.div({className: 'twitter-assistant'}, [
                    React.DOM.h1({}, "Twitter Assistant")
                ]);
            }
            else{
                const oldestTweet = tweetMine.getOldestTweet();
                const daysSinceOldestTweet = Math.round( (Date.now() - new Date(oldestTweet.created_at))/ONE_DAY );

                /*var ownTweets = tweetMine.getOwnTweets();
                console.log(ownTweets.map(tweet => {
                    return {
                        text: tweet.text,
                        rt: tweet.retweet_count
                    };
                }));*/
                
                return React.DOM.div({className: 'twitter-assistant'}, [
                    
                    React.DOM.h1({}, "Twitter Assistant"),
                    
                    TwitterAssistantTopInfo({
                        daysSinceOldestTweet: daysSinceOldestTweet,
                        tweetsConsidered: tweetMine.length
                    }),
                    
                    Histogram({
                        tweetMine: tweetMine,
                        histogramSize: HISTOGRAM_SIZE
                    }),
                    
                    React.DOM.h3({}, 'Timeline Composition'),
                    
                    TimelineComposition({
                        tweetMine: tweetMine,
                        users : users,
                        askMissingUsers : askUsers
                    }),
                    
                    React.DOM.h3({}, 'Generated Engagement'),
                    
                    GeneratedEngagement({
                        tweetMine: tweetMine
                    }),
                    
                    HumansAreNotMetricsReminder()
                    
                ]);
            }
        }
        
    });
        
})(this);

