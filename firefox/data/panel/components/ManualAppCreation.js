(function(exports){
    'use strict';

    
    exports.ManualAppCreation = React.createClass({
        
        render: function(){
            /*
                {
                   testCredentials({key, secret}) => void,
                   credentials: {key, secret},
                   switchToAutomated: () => void
                }
            */
            const data = this.props;
            
            const children = [
                React.DOM.p({}, 'Enter API key and secret'),
                TwitterAPICredentialsForm(data)
            ];
            
            if(!data.credentials){
                children.push(React.DOM.p({className: 'discrete'}, [
                    "Try to make a Twitter App ",
                    React.DOM.button({
                        className: "existing-app",
                        onClick: data.switchToAutomated
                    }, "automatically"),
                    " instead"
                ]))
            }
            
            return React.DOM.div({}, children);
        }
    });
        
})(this);
