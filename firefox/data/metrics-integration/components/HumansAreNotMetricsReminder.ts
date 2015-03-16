'use strict';

const HumansAreNotMetricsReminder = React.createClass({

    render: function(){ 
        return React.DOM.footer({className: 'TA-reminder'}, [
            React.DOM.strong({}, "Reminder: "),
            "A human being is more than the few metrics you see above."
        ]);
        // missing feedback link
    }

});

export = HumansAreNotMetricsReminder;
