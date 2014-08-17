(function(){
    'use strict';

    const RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

    const documentReadyP = new Promise( resolve => {
        document.addEventListener('DOMContentLoaded', function listener(){
            resolve(document);
            document.removeEventListener('DOMContentLoaded', listener);
        });
    });

    const ONE_DAY = 24*60*60*1000; // ms

    // put the div ASAP so the user knows Twitter Assistant exists
    const twitterAssistantContainerP = documentReadyP.then(document => {
        console.log('ready to integrate metrics')
        const rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
        if(!rightProfileSidebar){
            const msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
            throw new Error(msg);
        }
        
        var twitterAssistantContainer = document.createElement('div');
        twitterAssistantContainer.classList.add('twitter-assistant-container');

        const {tweetMine} = makeTweetMine([], '');
        React.renderComponent(TwitterAssistant(tweetMine), twitterAssistantContainer);
        
        rightProfileSidebar.insertBefore(twitterAssistantContainer, rightProfileSidebar.firstChild);

        return twitterAssistantContainer;
    }).catch(err => {
        console.error('twitterAssistantContainerP error', String(err));
    });


    self.port.on('twitter-user-data', data => {

        //console.log('received data from addon', data);

        let {user: username, timeline} = data;
        data = undefined;
        const {tweetMine} = makeTweetMine(timeline, username);
        timeline = undefined;


        twitterAssistantContainerP.then(twitterAssistantContainer => {
            console.log('ready to integrate metrics');

            React.renderComponent(TwitterAssistant(tweetMine), twitterAssistantContainer);

        }).catch(function(err){
            console.error('metrics integration error', String(err));
        });


    })
})();