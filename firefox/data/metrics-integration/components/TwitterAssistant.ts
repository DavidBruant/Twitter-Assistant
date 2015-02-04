/// <reference path="../../../defs/ES6.d.ts" />
/// <reference path="../../../defs/react-0.11.d.ts" />

'use strict';

import Histogram = require('./Histogram');
import TimelineComposition = require('./TimelineComposition');
import TwitterAssistantTopInfo = require('./TwitterAssistantTopInfo');
import GeneratedEngagement = require('./GeneratedEngagement');
import HumansAreNotMetricsReminder = require('./HumansAreNotMetricsReminder');
import TweetMine = require('../TweetMine');


var HISTOGRAM_SIZE = 30;
var ONE_DAY = 24*60*60*1000; // ms

interface TwitterAssistantProps{
    tweetMine: any //for now. TODO create TweetMine interface
    users: TwitterAPIUser[];
    askUsers: (userIds: TwitterUserId[]) => void;
}


var TwitterAssistant = React.createClass({
    
    render: function(){
        var data: TwitterAssistantProps = this.props, // TweetMine instance
            state = this.state;

        var tweetMine = data.tweetMine,
            users = data.users,
            askUsers = data.askUsers;

        if(tweetMine.length === 0){
            return React.DOM.div({className: 'twitter-assistant'}, [
                React.DOM.h1({}, "Twitter Assistant")
            ]);
        }
        else{
            var oldestTweet = tweetMine.getOldestTweet();
            var daysSinceOldestTweet = Math.round( (Date.now() - (new Date(oldestTweet.created_at)).getTime())/ONE_DAY );

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


export = TwitterAssistant;

