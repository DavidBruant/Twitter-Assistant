(function(exports){
    'use strict';
    
    /*
        details: [
            {
                amount: number,
                text: string,
                url: string (url),
                image: string (url)
            }
        ]
    
    */
    
    
    const totalHeight = 300;
    
    
    exports.DetailList = React.createClass({
        
        render: function(){
            let {details} = this.props;

            // only keep 10 top items
            details = details.slice(0, 10);

            const totalConsideredCount = details
                .reduce( (acc, {amount}) => {return acc+amount}, 0 );

            return React.DOM.ol(
                {className: 'weighted-user-list'},
                details.map(({amount, text, url, image}) => {

                    return React.DOM.li({
                        style: {
                            height: (totalHeight*amount/totalConsideredCount) + 'px'
                        }
                    },
                    React.DOM.a({
                        href: url || '',
                        target: '_blank'
                    }, [
                        image ? React.DOM.img({src: image}) : undefined,
                        React.DOM.span({}, text),
                        React.DOM.span({}, ' '+String(amount))
                    ]))
            }));
        }
    });
        
})(this);


