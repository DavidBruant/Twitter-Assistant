'use strict';

/*
    {
        loggedUser: string
        attemptLogin: () => {}
        changeTwitterAssistantServerDomain:
    }
*/

const DEFAULT_TWITTER_ASSISTANT_SERVER_ORIGIN = 'http://localhost:3737/';

(function(global){
    global.TwitterAssistantPanel = React.createClass({
        displayName: 'TwitterAssistantPanel',
        
        render: function(){
            const props = this.props;
            
            if(props.errorMessage)
                console.error(props.errorMessage);
            
            return React.DOM.div({},
                React.DOM.h1({}, 'Twitter Assistant'),
                React.DOM.h2({}, 'Hello' + (props.loggedUser ? ' @'+props.loggedUser.screen_name : '') + '!'),
                !props.loggedUser ? React.DOM.button({
                    onClick(e){
                        console.log('ckucj')
                        props.signinWithTwitter();
                    }
                }, 'Sign in with Twitter') : "You're all set :-) Look at someone's profile on Twitter!",
                
                props.errorMessage ? React.DOM.section({className: 'error'}, props.errorMessage) : undefined,
                                 
                React.DOM.footer({},
                    React.DOM.a(
                        { 
                            href: "mailto:bruant.d+ta@gmail.com",
                            title: "The addon author is here to help out!"
                        },
                        'Help'
                    )
                )
            );
        }
    });  
})(this);
