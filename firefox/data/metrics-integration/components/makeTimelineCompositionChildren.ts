"use strict";

function makeTimelineCompositionChildren(values: any, onDetailViewChange: any){

    return values.map((v:any) => {
        const clickable = !!v.details;

        return React.DOM.div( {
            className: [
                v.class,
                clickable ? 'TA-trigger' : ''
            ].filter(s => !!s).join(' '),
            title: v.title,
            style: {
                width: v.percent.toFixed(1)+'%'
            },
            onClick: !clickable ? undefined : () => {
                onDetailViewChange({
                    class: v.class,
                    details: v.details
                });
            }
        });
    });
}

export = makeTimelineCompositionChildren;