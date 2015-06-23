'use strict';

const ONE_DAY = 24*60*60*1000;

const MAX_TWEETS_PER_DAY = 15;
    
const Histogram = React.createClass({

    render: function(){
        /*
            {
                tweetMine: TweetMine,
                histogramSize: number
            }
        */
        const data = this.props; 

        const tweetMine = data.tweetMine, 
            histogramSize = data.histogramSize;

        return React.DOM.section( {className: 'TA-activity'}, Array(histogramSize).fill(0).map((e, i) => {
            let today = (new Date()).getTime();
            today = today - today%ONE_DAY; // beginning of today

            const thisDayTweets = tweetMine.byDateRange(today - i*ONE_DAY, today - (i-1)*ONE_DAY);

            const height = Math.min(thisDayTweets.length/MAX_TWEETS_PER_DAY , 1)*100;
            // TODO add a class when > 1
            return React.DOM.div({
                className: 'TA-bar',
                "data-value": thisDayTweets.length
            },  React.DOM.div({
                    className: "TA-tweets",
                    style: {
                        height: height +'%'
                    }
                })
            );
        }).reverse())
    }
});
        
export = Histogram;
