(function(exports){
    'use strict';

    exports.HumansAreNotMetricsReminder = React.createClass({
        
        render: function(){ 
            const data = this.props;
            
            return React.DOM.footer({},
                React.DOM.p({}, [
                    React.DOM.strong({}, "Warning: "),
                    "There is more to a person than the few metrics shown above"
                ])
            );
        }
    });
        
})(this);
