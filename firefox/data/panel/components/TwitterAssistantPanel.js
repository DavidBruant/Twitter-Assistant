(function(exports){
    'use strict';

    
    exports.TwitterAssistantPanel = React.createClass({
        
        getInitialState: function(){
            return {
                effort: 'automated'
            };
        },
        
        render: function(){
            /*
                {
                    loggedUser: string ('DavidBruant'),
                    credentials : {
                        key: 'blablba',
                        secret: 'blibli'
                    },
                    
                    automateTwitterAppCreation: () => void,
                    testCredentials: {key, secret} => void
                }
            */
            const data = this.props;
            const state = this.state;
            
            const children = [
                React.DOM.h1({}, "Twitter Assistant"),   
                React.DOM.h2({}, "Hello" + (data.loggedUser?' @'+data.loggedUser : '') + '!')
            ];
            
            if(data.loggedUser){
                if(data.credentials){
                    children.push(
                        "You're all set :-) Look at someone's profile on Twitter!"
                    )
                }
                else{
                    
                    if(state.effort === 'automated'){
                        children.push(AutomatedAppCreation({
                            automateTwitterAppCreation: data.automateTwitterAppCreation,
                            switchToManual: () => {
                                this.setState({effort: 'manual'});
                            }
                        }));
                    }
                    else{
                        children.push(ManualAppCreation({
                            testCredentials: data.testCredentials,
                            switchToAutomated: () => {
                                this.setState({effort: 'automated'});
                            },
                            credentials: data.credentials
                        }));
                    }
                }
            }
            else{
                children.push( React.DOM.a({
                    target: '_blank',
                    href: 'https://twitter.com/'
                }, "Please, login to your Twitter account.") );
            }
                
            return React.DOM.div({}, children);
        }
    });
        
})(this);
