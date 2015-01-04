'use strict';

var TwitterAssistantTopInfo = React.createClass({

    render: function(){
        /*
            {
                daysSinceOldestTweet: number,
                tweetsConsidered: number
            }
        */
        var data = this.props;

        return React.DOM.h2(
            {},
            'Last '+data.daysSinceOldestTweet+' days activity ('+data.tweetsConsidered+' tweets)'
        );
    }
});
        
export = TwitterAssistantTopInfo;
