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

/*
const twitterAssistantContent =
'<h2>Last '+daysSinceOldestTweet+' days activity ('+stats.tweetsConsidered+' tweets)</h2>' +
'<div class="histo-range">' +
    (
        Array(30).fill(0).map((e, i) => {
            let today = (new Date()).getTime();
            today = today - today%ONE_DAY; // beginning of today

            const thisDayTweets = tweetMine.byDateRange(today - i*ONE_DAY, today - (i-1)*ONE_DAY);

            const height = Math.min(thisDayTweets.length/MAX_TWEETS_PER_DAY , 1)*100;
            // TODO add a class when > 1
            return '<div style="height: '+ height +'%;" title="'+thisDayTweets.length+'"></div>'; // begging to be transformed into a React component
        }).reverse().join('')
    ) +
'</div>' + 
'<div class="legend">' + 
    '<div>'+HISTOGRAM_SIZE+' days ago</div>' +
    '<div>today</div>' + 
'</div>' + 
'<h3>Timeline composition</h3>' +
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
'</div>' + 
'<footer><p><strong>Warning</strong>: There is more to a person than the few metrics that are shown above</p></footer>';

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
                    TimelineComposition({
                        tweetMine: tweetMine
                    }),
                    HumansAreNotMetricsReminder()
                ]);
            }
        }
        
    });
        
})(this);

