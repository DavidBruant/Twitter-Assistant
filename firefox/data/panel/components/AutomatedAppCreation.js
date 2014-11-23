(function(exports){
    'use strict';

    
    exports.AutomatedAppCreation = React.createClass({
        getInitialState: function(){
            return {
                pendingAppCreation: false
            };
        },
        
        
        render: function(){
            /*
                {
                    automateTwitterAppCreation: () => void,
                    switchToManual: () => void
                }
            */
            const data = this.props;
            const state = this.state;
            
            return React.DOM.div({}, [
                // Why the user is being bothered
                React.DOM.p({}, [
                    "You need a 'Twitter App' to use Twitter Assistant."
                ]),

                // Quick action
                React.DOM.div({className: 'app-creation' + (state.pendingAppCreation ? ' pending' : '')}, React.DOM.button({
                    className: 'automatic',
                    disabled: state.pendingAppCreation ? 'disabled' : null,
                    onClick: e => {
                        data.automateTwitterAppCreation();
                        this.setState({
                            pendingAppCreation: true
                        });
                    }
                }, "Create an app automatically")),

                // Explain what's about to happen
                React.DOM.div({/*className: "instructions"*/}, [
                    React.DOM.p({}, "A tab will open in the background. On your behalf, it's going to:"),
                    React.DOM.ol({}, [
                        React.DOM.li({}, React.DOM.strong({}, "Create a Twitter app")),
                        React.DOM.li({}, [
                            React.DOM.strong({}, "Accept"),
                            " the ",
                            React.DOM.a({
                                target: "_blank",
                                href: "https://dev.twitter.com/terms/api-terms"
                            }, 'Twitter API terms of services ("Developer rules of the road")')
                        ]),
                        React.DOM.li({}, [
                            "When the app is created, the addon will ",
                            React.DOM.strong({}, 'fetch the "API key" and "API secret"'),
                            ' from the "API keys" tab.'
                        ])
                    ])
                ]), 

                // Alternatives
                React.DOM.p({className: 'discrete'}, [
                    "You can also ",
                    React.DOM.a({
                        target: '_blank',
                        href: 'http://iag.me/socialmedia/how-to-create-a-twitter-app-in-8-easy-steps/',
                        onClick: data.switchToManual
                    }, 'create an app manually "in 8 easy steps"'),
                    " or maybe ",
                    React.DOM.button({
                        className: "existing-app",
                        onClick: data.switchToManual
                    }, "you already have one")
                ])
            ]);
        }
    });
        
})(this);
