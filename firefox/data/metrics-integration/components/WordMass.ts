'use strict';

import showTweetList = require('../showTweetList');

interface WordMassProps{
    wordToTweetsMap: Map<string, TwitterAPITweet[]>
}

console.log('WordTweetTreeMap');

const WordMass = React.createClass({

    getInitialState: function(){
        return {};
    },

    render: function(){
        const props = this.props;
        const wordToTweetsMap = props.wordToTweetsMap;

        const CONSIDERED_WORDS = 30;

        //console.log('wordToTweetsMap', wordToTweetsMap);
        
        const wordToTweetsEntries: Array<{word: string, tweets: TwitterAPITweet[]}> = [];
        wordToTweetsMap.forEach((tweets:TwitterAPITweet[], word: string) => {
            if(tweets.length >= 2)
                wordToTweetsEntries.push({tweets, word})
        })
 
        const sortedEntries: Array<{word: string, tweets:TwitterAPITweet[]}> = wordToTweetsEntries
        .sort(({word: w1, tweets: tweets1}, {word: w2, tweets: tweets2}) => tweets2.length - tweets1.length);
        const limitedEntries = sortedEntries.slice(0, CONSIDERED_WORDS);

        //const lengthSum = limitedEntries.reduce((acc, [w, tweets]) => {return acc + tweets.length}, 0); 
        //console.log("limitedEntries", limitedEntries.map(({tweets}) => tweets.length))

        const widthAdjustment = 80/(limitedEntries[0].tweets.length);


        return React.DOM.ol({className: 'word-mass'}, limitedEntries.map(({word, tweets}) => {                    

            var width = tweets.length*widthAdjustment;

            return React.DOM.li(
                {
                    title: word
                },
                React.DOM.div(
                    {
                        onClick: e => {
                            showTweetList(tweets, "Tweets with the word '"+word+"'")
                        }
                    }, 
                    React.DOM.span({
                        className: "proportion",
                        style: {
                            width: width+'%',                            
                        }
                    }),
                    React.DOM.span({className: 'word'}, word)
                )    
                
                
            );


        }));
    }

});

export = WordMass;