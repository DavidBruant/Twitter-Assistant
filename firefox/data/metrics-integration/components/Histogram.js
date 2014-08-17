(function(exports){
    'use strict';
    
    const MAX_TWEETS_PER_DAY = 15;
    
    exports.Histogram = React.createClass({
        
        render: function(){
            /*
                {
                    tweetMine: TweetMine,
                    histogramSize: number
                }
            */
            const data = this.props; 
            
            const {tweetMine, histogramSize} = data;
            
            return React.DOM.div( {className: 'histogram'}, [
                React.DOM.div({className: "histo-range"}, Array(histogramSize).fill(0).map((e, i) => {
                    let today = (new Date()).getTime();
                    today = today - today%ONE_DAY; // beginning of today

                    const thisDayTweets = tweetMine.byDateRange(today - i*ONE_DAY, today - (i-1)*ONE_DAY);

                    const height = Math.min(thisDayTweets.length/MAX_TWEETS_PER_DAY , 1)*100;
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
        
})(this);
