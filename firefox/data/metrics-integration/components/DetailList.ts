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

const totalHeight = 300;

const DetailList = React.createClass({

    render: function(){
        let details : DetailsData[] = this.props.details;

        // only keep 10 top items
        details = details.slice(0, 10);

        const totalConsideredCount = details
            .reduce( (acc, data) => {return acc+data.amount}, 0 );

        return React.DOM.div({className: 'TA-composition-details TA-active'},
            React.DOM.ol({className: 'TA-composition-details-inner'}, details.map((detailsData) => {
                var amount = detailsData.amount, 
                    text = detailsData.text, 
                    url = detailsData.url, 
                    image = detailsData.image;
                

                return React.DOM.li({
                    className: "TA-account account-summary"
                }, [
                    React.DOM.div({
                        className : "TA-account-value",
                        style: {
                            width: (amount*100/totalConsideredCount) + '%'
                        },
                        'data-value': amount
                    }),
                    React.DOM.div({className : "TA-account-inner"}, [
                        React.DOM.div({className: "TA-account-content content"}, [
                            React.DOM.a({
                                className: "TA-account-group account-group",
                                href: url || '',
                                target: '_blank'
                            }, [
                                image ? React.DOM.img({className: 'TA-avatar avatar', src: image}) : undefined,
                                React.DOM.span({className: 'TA-account-group-inner account-group-inner'}, [
                                    React.DOM.b({className: 'TA-fullname fullname'}, text)
                                    // missing <span class="TA-username username"><s>@</s><span>thibautseguy</span></span>
                                ])
                            ])    
                        ])    
                    ]),     
                ]);
                
                // missing TA-composition-details-more
                
            }))
        );
    }

});


export = DetailList;
