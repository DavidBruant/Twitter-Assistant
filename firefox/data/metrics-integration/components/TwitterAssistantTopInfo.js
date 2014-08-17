(function(exports){
    'use strict';

    
    exports.TwitterAssistantTopInfo = React.createClass({
        
        render: function(){
            /*
                {
                    daysSinceOldestTweet: number,
                    tweetsConsidered: number
                }
            */
            const data = this.props;
            
            return React.DOM.h2(
                {},
                'Last '+data.daysSinceOldestTweet+' days activity ('+data.tweetsConsidered+' tweets)'
            );
        }
    });
        
})(this);
