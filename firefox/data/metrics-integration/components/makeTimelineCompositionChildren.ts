"use strict";

function makeTimelineCompositionChildren(values: any, onDetailViewChange: any){

    return values.map((v:any) => {
        const clickable = !!v.details;

        return React.DOM.div( {
            className: [
                v.class,
                clickable ? 'clickable' : ''
            ].filter(s => !!s).join(' '),
            title: v.title,
            style: {
                width: v.percent.toFixed(1)+'%'
            },
            onClick: !clickable ? undefined : () => {
                onDetailViewChange(v.details);
            }
        });
    });
}

export = makeTimelineCompositionChildren;