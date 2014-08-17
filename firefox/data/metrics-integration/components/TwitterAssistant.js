// Assumes React is loaded

// Assumes TwitterAssistantMainInfo component
// Assumes Histogram component
// Assumes TimelineComposition component
// Assumes HumansAreNotMetricsReminder component

/*
<h1>Twitter Assistant</h1>
<h2>April 1st - May 1st 2014 activity</h2>
<div class="histo-range">
    <div style="height: 40%;"></div>
    <div style="height: 42%;"></div>
    <div style="height: 39%;"></div>
</div>
<div class="legend">
    <div>April 1st</div>
    <div>May 1st</div>
</div>

<h3>Timeline composition</h3>

<h4>Most used words</h4>
<div class="most-used-words">
    <span>Bordeaux</span>
    <span>tour</span>
    <span>vin</span>  
    <span>tourisme</span>
</div>  

<h3>Generated Engagement</h3>
<div class="all-metrics">
    <div class="metrics">
        <div class="name">Retweets</div>
        <div class="value">51</div>
    </div>
    <div class="metrics">
        <div class="name">Favorites</div>
        <div class="value">55</div>
    </div>
    <div class="metrics">
        <div class="name">Replies</div>
        <div class="value">12</div>
    </div>
</div>
*/


(function(exports){
    'use strict';

    const HISTOGRAM_SIZE = 30;
    
    exports.TwitterAssistant = React.createClass({
        
        render: function(){
            const data = this.props, // TweetMine instance
                state = this.state;
            
            const tweetMine = data;
            
            if(tweetMine.length === 0){
                return React.DOM.div({className: 'twitter-assistant'}, [
                    React.DOM.h1({}, "Twitter Assistant")
                ]);
            }
            else{
                const oldestTweet = tweetMine.getOldestTweet();
                const daysSinceOldestTweet = Math.round( (Date.now() - new Date(oldestTweet.created_at))/ONE_DAY );

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
                        tweetMine: tweetMine
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

