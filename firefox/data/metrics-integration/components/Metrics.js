(function(exports){
    'use strict';
    
    exports.Metrics = React.createClass({
        getInitialState: function(){
            return {detailView: undefined};
        },
        
        componentWillReceiveProps: function(nextProps){
            
            if(this.state.detailView){
                const newState = {
                    detailView: nextProps.values.find(e => e.class === this.state.detailView.class)
                };
                
                this.setState(newState);
            }
        },
        
        /*
            {
                name: string
                values: [
                    {
                        class: string,
                        title: string,
                        percent: number (between 0 and 100)
                        details : [
                            {
                                amount: number,
                                text: string,
                                url: string (url),
                                image: string (url)
                            }
                        ]
                    }
                ]
            }
        */
        render: function(){
            const data = this.props;
            const state = this.state;
            
            const {name, values} = data;
            
            const fractionContainerClasses = ["fraction-container"];
            var fractionContainerChildren;
            
            if(values.length === 1){
                const value = values[0];
                const times = Math.floor(value.percent/100);
                const rest = value.percent - times*100;
                
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
                    const clickable = !!v.details;
                    
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
            
            var children = [];
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
    
})(this);
