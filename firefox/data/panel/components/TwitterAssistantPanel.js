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
            
            // "You're all set :-) Look at someone's profile on Twitter!"
                    
            /*
            React.DOM.a(
                { target: '_blank', href: 'https://twitter.com/' },
                "Please, login to your Twitter account."
            );
            */
            
            return React.DOM.div({},
                React.DOM.h1({}, 'Twitter Assistant'),
                React.DOM.h2({}, 'Hello' + (props.loggedUser ? ' @'+props.loggedUser.screen_name : '') + '!'),
                !props.loggedUser ? React.DOM.button({
                    onClick(e){
                        console.log('ckucj')
                        props.signinWithTwitter();
                    }
                }, 'Sign in with Twitter') : undefined,
                                 
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
