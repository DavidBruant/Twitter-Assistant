(function(exports){
    'use strict';

    
    exports.TwitterAPICredentialsForm = React.createClass({
        
        render: function(){
            /*
                {
                   credentials: {key, secret},
                   testCredentials: {key, secret} => void,
                   forgetCredentials: () => void
                }
            */
            const data = this.props;

            /*
            <form class="api-credentials">
                <label><span>API key</span> <input class="key" type="text" size="30"></label>
                <label><span>API secret</span> <input class="secret" type="text" size="30"></label>
                <button type="submit">OK</button>
            </form>
            */
            
            return React.DOM.form({
                className: 'api-credentials',
                onSubmit: e => {
                    e.preventDefault();
                    
                    var key = this.refs.key.getDOMNode().value,
                        secret = this.refs.secret.getDOMNode().value;

                    console.log('form submit', key, secret);

                    if(!key || !secret || key.length <= 1 || secret.length <= 1)
                        return; // ignore

                    data.testCredentials({key: key, secret: secret});
                }
            }, [
                React.DOM.label({}, [
                    React.DOM.span({}, "API key"),
                    React.DOM.input({
                        className: 'key',
                        type: 'text',
                        size: '30',
                        ref: 'key',
                        defaultValue: data.credentials && data.credentials.key
                    })
                ]),
                React.DOM.label({}, [
                    React.DOM.span({}, "API secret"),
                    React.DOM.input({
                        className: 'secret',
                        type: 'text',
                        size: '30',
                        ref: 'secret',
                        defaultValue: data.credentials && data.credentials.secret
                    })
                ]),
                React.DOM.button({type: "submit"}, 'OK')/*,
                React.DOM.p({
                    style: {
                        display: 'inline-block',
                        margin: 0,
                        "vertical-align": 'middle'
                    }
                }, React.DOM.button({
                    type: 'button',
                    onClick: e => {
                        //console.log('clear click', this.refs.key.getDOMNode().value)
                        this.refs.key.getDOMNode().value = '',
                        this.refs.secret.getDOMNode().value = '';
                        
                        data.forgetCredentials();
                    }
                }, 'forget these credentials'))*/
            ]);
        }
    });
        
})(this);
