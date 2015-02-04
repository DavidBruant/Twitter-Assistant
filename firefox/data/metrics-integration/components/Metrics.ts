'use strict';

import DetailList = require('./DetailList');

// duplicated from DetailList
interface DetailsData{
    amount: number
    text: string
    url: string //(url)
    image: string //(url)
}

interface MetricsState{
    detailView: MetricsPropsValue
}

interface MetricsPropsValue{
    class?: string
    title?: string
    percent: number //(between 0 and 100)
    details? : DetailsData[]
}

interface MetricsProps{
    name?: string
    values: MetricsPropsValue[]
}

var Metrics = React.createClass({
    getInitialState: function() : MetricsState{
        return {detailView: undefined};
    },

    componentWillReceiveProps: function(nextProps: MetricsProps){

        if(this.state.detailView){
            var newState = {
                detailView: nextProps.values.find(e => e.class === this.state.detailView.class)
            };

            this.setState(newState);
        }
    },
    
    render: function(){
        var data : MetricsProps = this.props;
        var state : MetricsState = this.state;

        var name = data.name, 
            values = data.values;
        

        var fractionContainerClasses = ["fraction-container"];
        var fractionContainerChildren : any; // Actually a ReactChild (ReactElement | string), but union types aren't there yet

        if(values.length === 1){
            var value = values[0];
            var times = Math.floor(value.percent/100);
            var rest = value.percent - times*100;

            fractionContainerClasses.push( times <= 5 ? ('x'+times+'-'+(times+1)) : 'lots' )

            fractionContainerChildren = times <= 5 ?
                React.DOM.div( {
                    className: ["value", value.class].filter(s => !!s).join(' '),
                    title: value.title,
                    style: {
                        width: rest.toFixed(1)+'%'
                    }
                }) :
                value.percent.toFixed(1) + '%';
        }
        else{
            fractionContainerChildren = values.map(v => {
                var clickable = !!v.details;

                return React.DOM.div( {
                    className: [
                        "value",
                        v.class,
                        clickable ? 'clickable' : '',
                        state.detailView === v ? 'selected' : ''
                    ].filter(s => !!s).join(' '),
                    title: v.title,
                    style: {
                        width: v.percent.toFixed(1)+'%'
                    },
                    onClick: !clickable ? undefined : () => {
                        console.log('click', v.percent);
                        this.setState({
                            detailView: state.detailView === v ? undefined : v
                        });
                    }
                });
            });
        }

        var children : any[] = []; // Actually a ReactChild (ReactElement | string), but union types aren't there yet
        if(name)
            children.push(React.DOM.div( {className: "name"}, name ));

        children.push(React.DOM.div(
            {className: fractionContainerClasses.join(' ')},
            fractionContainerChildren
        ));

        if(state.detailView)
            children.push( DetailList({details: state.detailView.details}) );

        return React.DOM.div( {className: "metrics"}, children)
    }

});


export = Metrics;