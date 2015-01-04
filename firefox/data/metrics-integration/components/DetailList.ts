'use strict';

interface DetailsData{
    amount: number
    text: string
    url: string //(url)
    image: string //(url)
}

interface DetailsProps{
    details: DetailsData[]
}

var totalHeight = 300;

var DetailList = React.createClass({

    render: function(){
        var details : DetailsData[] = this.props.details;

        // only keep 10 top items
        details = details.slice(0, 10);

        var totalConsideredCount = details
            .reduce( (acc, data) => {return acc+data.amount}, 0 );

        return React.DOM.ol(
            {className: 'weighted-user-list'},
            details.map((detailsData) => {
                var amount = detailsData.amount, 
                    text = detailsData.text, 
                    url = detailsData.url, 
                    image = detailsData.image;
                

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


export = DetailList;
