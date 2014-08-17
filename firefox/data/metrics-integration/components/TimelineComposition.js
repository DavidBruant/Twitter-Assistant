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
            
            return React.DOM.div( {className: "all-metrics"}, [
                Metrics({
                    name: 'Tweet type',
                    values : [{
                            class: 'retweets',
                            title: "Retweets",
                            percent: tweetMine.getRetweets().length*100/tweetMine.length
                        }, {
                            class: 'conversations',
                            title: "Conversations",
                            percent: tweetMine.getConversations().length*100/tweetMine.length
                        }
                    ]
                }),
                Metrics({
                    name: 'With link',
                    values : [{
                            title: "Non-media links",
                            percent: tweetMine.getTweetsWithLinks().length*100/tweetMine.length
                        }
                    ]
                })
            ]);
        }
    });
        
})(this);
