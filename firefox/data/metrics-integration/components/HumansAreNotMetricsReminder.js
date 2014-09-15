(function(exports){
    'use strict';

    exports.HumansAreNotMetricsReminder = React.createClass({
        
        render: function(){ 
            const data = this.props;
            
            return React.DOM.footer({},
                React.DOM.p({}, [
                    React.DOM.strong({}, "Reminder: "),
                    "A human being is more than the few metrics you see above."
                ])
            );
        }
    });
        
})(this);
