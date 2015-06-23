'use strict';

interface TweetsPerDayEstimateProps{
    addonUserAlreadyFollowingVisitedUser: boolean
    estimate: number
}

const TweetsPerDayEstimate = React.createClass({

    render: function(){ 
        const props : TweetsPerDayEstimateProps = this.props;
        
        console.log('estimate', props.estimate);

        return React.DOM.section(
            {className: 'tweets-per-day-estimate'},
            props.addonUserAlreadyFollowingVisitedUser ?
                'Following this account contributes ~'+ props.estimate.toFixed(2) + ' tweets per day to your timeline' :
                'Following this account would add ~'+ props.estimate.toFixed(2) + ' tweets per day to your timeline'
        );
    }
});

export = TweetsPerDayEstimate;