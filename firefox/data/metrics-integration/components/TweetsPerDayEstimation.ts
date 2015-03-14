'use strict';

interface TweetsPerDayEstimationProps{
    addonUserAlreadyFollowingVisitedUser: boolean
    estimate: number
}

const TweetsPerDayEstimation = React.createClass({

    render: function(){ 
        const props : TweetsPerDayEstimationProps = this.props;
        
        console.log('estimate', props.estimate)

        return React.DOM.section({className: 'tweets-per-day-estimation'}, []
            /*React.DOM.p({}, [
                React.DOM.strong({}, "Reminder: "),
                "A human being is more than the few metrics you see above."
            ])*/
        );
    }
});

export = TweetsPerDayEstimation;