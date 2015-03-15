'use strict';

interface TweetsPerDayEstimationProps{
    addonUserAlreadyFollowingVisitedUser: boolean
    estimate: number
}

const TweetsPerDayEstimation = React.createClass({

    render: function(){ 
        const props : TweetsPerDayEstimationProps = this.props;
        
        console.log('estimate', props.estimate);

        return React.DOM.section(
            {className: 'tweets-per-day-estimation'},
            props.addonUserAlreadyFollowingVisitedUser ?
                'Following this account contributes ~'+ props.estimate.toFixed(2) + ' tweets per day to your timeline' :
                'Following this account would add ~'+ props.estimate.toFixed(2) + ' tweets per day to your timeline'
        );
    }
});

export = TweetsPerDayEstimation;