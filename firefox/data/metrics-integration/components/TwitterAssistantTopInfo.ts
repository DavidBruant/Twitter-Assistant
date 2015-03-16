'use strict';

interface TwitterAssistantTopInfoProps{
    nbDays: number
    tweetsConsidered: number
}

const TwitterAssistantTopInfo = React.createClass({

    render: function(){
        const props : TwitterAssistantTopInfoProps = this.props;

        return React.DOM.section({className: 'TA-section-title'}, [
            // TODO make props.nbDays a button with className="TA-graduation btn-link"
            'Last '+props.nbDays+' days activity: '+props.tweetsConsidered+' tweets'
        ]);
    }
});
        
export = TwitterAssistantTopInfo;
