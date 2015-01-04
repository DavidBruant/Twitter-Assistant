'use strict';

var ONE_DAY = 24*60*60*1000;

var MAX_TWEETS_PER_DAY = 15;
    
var Histogram = React.createClass({

    render: function(){
        /*
            {
                tweetMine: TweetMine,
                histogramSize: number
            }
        */
        var data = this.props; 

        var tweetMine = data.tweetMine, 
            histogramSize = data.histogramSize;

        return React.DOM.div( {className: 'histogram'}, [
            React.DOM.div({className: "histo-range"}, Array(histogramSize).fill(0).map((e, i) => {
                var today = (new Date()).getTime();
                today = today - today%ONE_DAY; // beginning of today

                var thisDayTweets = tweetMine.byDateRange(today - i*ONE_DAY, today - (i-1)*ONE_DAY);

                var height = Math.min(thisDayTweets.length/MAX_TWEETS_PER_DAY , 1)*100;
                // TODO add a class when > 1
                return React.DOM.div({
                    style: {height: height +'%'},
                    title: thisDayTweets.length
                });
            }).reverse()),
            React.DOM.div({className: "legend"}, [
                React.DOM.div({}, histogramSize+' days ago'),
                React.DOM.div({}, 'today'),
            ])
        ]);
    }
});
        
export = Histogram;
