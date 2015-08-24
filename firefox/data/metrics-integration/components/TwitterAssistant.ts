/// <reference path="../../../defs/ES6.d.ts" />
/// <reference path="../../../defs/react-0.11.d.ts" />

'use strict';

import Histogram = require('./Histogram');
import TimelineComposition = require('./TimelineComposition');
import TwitterAssistantTopInfo = require('./TwitterAssistantTopInfo');
import HumansAreNotMetricsReminder = require('./HumansAreNotMetricsReminder');
import TweetsPerDayEstimate = require('./TweetsPerDayEstimate');
import DetailList = require('./DetailList');
import WordMass = require('./WordMass');
import GeneratedEngagement = require('./GeneratedEngagement');

import TweetMine = require('../TweetMine');


const ONE_DAY = 24*60*60*1000; // ms

interface TwitterAssistantProps{
    tweetMine: any //for now. TODO create TweetMine interface
    displayDayCount: number
    users: TwitterAPIUser[];
    askUsers: (userIds: TwitterUserId[]) => void;
    addonUserAlreadyFollowingVisitedUser: boolean
    visitedUserIsAddonUser: boolean
}


var TwitterAssistant = React.createClass({
    getInitialState: function(){
        return <any>{
            details: undefined,
            class: undefined
        };
    },
    
    render: function(){
        const data: TwitterAssistantProps = this.props,
            state = this.state;

        const tweetMine = data.tweetMine,
            users = data.users,
            askUsers = data.askUsers;

        if(tweetMine.length === 0){
            return React.DOM.div({className: 'TA WhoToFollow is-visible'}, [
                React.DOM.header({className: 'TA-header WhoToFollow-header'}, [
                    React.DOM.h3({className: 'TA-title WhoToFollow-title'}, "Twitter Assistant"),
                    React.DOM.a({
                        href: "mailto:bruant.d+ta@gmail.com",
                        title: "The addon author is here to help out!"
                    }, 'Help')
                ]),
                React.DOM.p({}, 'No tweets over the last '+data.displayDayCount+' days')
            ]);
        }
        else{
            const oldestTweet = tweetMine.getOldestTweet();
            const daysSinceOldestTweet = Math.round( (Date.now() - (new Date(oldestTweet.created_at)).getTime())/ONE_DAY );

            /*var ownTweets = tweetMine.getOwnTweets();
            console.log(ownTweets.map(tweet => {
                return {
                    text: tweet.text,
                    rt: tweet.retweet_count
                };
            }));*/
            
            const estimate = tweetMine.getTweetsThatWouldBeSeenIfAddonUserFollowedVisitedUser().length/daysSinceOldestTweet;

            return React.DOM.div({className: 'TA WhoToFollow is-visible'}, [

                React.DOM.header({className: 'TA-header WhoToFollow-header'}, [
                    React.DOM.h3({className: 'TA-title WhoToFollow-title'}, "Twitter Assistant"),
                    ' · ',
                    React.DOM.a({
                        href: "mailto:bruant.d+ta@gmail.com",
                        title: "The addon author is here to help out!"
                    }, 'Help')
                ]),

                TwitterAssistantTopInfo({
                    nbDays: daysSinceOldestTweet,
                    tweetsConsidered: tweetMine.length
                }),

                data.visitedUserIsAddonUser ? undefined : TweetsPerDayEstimate({
                    addonUserAlreadyFollowingVisitedUser: data.addonUserAlreadyFollowingVisitedUser,
                    estimate: estimate
                }),
                
                Histogram({
                    tweetMine: tweetMine,
                    histogramSize: data.displayDayCount
                }),

                
                React.DOM.div({className: "TA-period"}, [
                    React.DOM.div({className: "TA-period-from"}, data.displayDayCount+' days ago'),
                    React.DOM.div({className: "TA-period-to"}, 'today'),
                ]),
                
                React.DOM.div({className: "TA-section-title"}, 'Timeline Composition'),

                TimelineComposition({
                    tweetMine: tweetMine,
                    users : users,
                    askMissingUsers : askUsers,
                    showDetails: (fragmentDetails: any) => {
                        const details = fragmentDetails.details;
                        const className = fragmentDetails.class;
                        
                        console.log('show details', state.details, details);
                        
                        this.setState(state.class === className ? {details: undefined, class: undefined} : fragmentDetails);
                    }
                }),

                state.details ? DetailList({details: state.details}) : undefined,
                
                WordMass({wordToTweetsMap: tweetMine.getWordMap()}),
                
                /*React.DOM.div({className: "TA-section-title"}, 'Generated Engagement'),

                GeneratedEngagement({
                    tweetMine: tweetMine
                }),*/

                HumansAreNotMetricsReminder()

            ]);
        }
    }
        
});


export = TwitterAssistant;

