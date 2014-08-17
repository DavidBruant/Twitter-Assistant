/*
'<div class="all-metrics">' +
    '<div class="metrics">' +
        '<div class="name">Tweet type</div>' +
        '<div class="fraction-container">' +
            '<div class="value retweets" title="Retweets" style="width: '+retweetPercent.toFixed(1)+'%;"></div>' +
            '<div class="value conversations" title="Conversations" style="width: '+
                (tweetMine.getConversations().length*100/tweetMine.length).toFixed(1)+'%;"></div>' +
        '</div>' +
    '</div>' +
    '<div class="metrics">' +
        '<div class="name" title="non-media links">With link</div>' +
        '<div class="fraction-container">' +
            '<div class="value" style="width: '+tweetsWithLinkPercent.toFixed(1)+'%;"></div>' +
        '</div>' +
    '</div>' +
'</div>'

*/

(function(exports){
    'use strict';

    const Metrics = React.createClass({
        
        render: function(){
            const data = this.props;
            
            const {name, values} = data;
            
            return React.DOM.div( {className: "metrics"}, [
                React.DOM.div( {className: "name"}, name ),
                React.DOM.div( {className: "fraction-container"}, values.map(v => {
                    return React.DOM.div( {
                        className: "value "+v.class,
                        title: v.title,
                        style: {
                            width: v.percent.toFixed(1)+'%'
                        }
                    });
                }))
            ])
        }
        
    });
    
    
    
    exports.TimelineComposition = React.createClass({
        
        render: function(){
            /*
                {
                    tweetMine: TweetMine
                }
            */
            const data = this.props;
            
            const {tweetMine} = data;
            
            /*
            const retweetPercent = (stats.retweetsCount/stats.tweetsConsidered)*100;
            const tweetsWithLinkPercent = (stats.tweetsWithLinkCount/stats.tweetsConsidered)*100;
            */
            
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
