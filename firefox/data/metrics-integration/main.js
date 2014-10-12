
const ONE_DAY = 24*60*60*1000; // ms

(function(){
    'use strict';

    const RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

    const documentReadyP = new Promise( resolve => {
        document.addEventListener('DOMContentLoaded', function listener(){
            resolve(document);
            document.removeEventListener('DOMContentLoaded', listener);
        });
    });

    // Initial "empty" rendering ASAP so the user knows Twitter Assistant exists
    const twitterAssistantContainerP = documentReadyP.then(document => {
        
        const rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
        if(!rightProfileSidebar){
            const msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
            throw new Error(msg);
        }
        
        var twitterAssistantContainer = document.createElement('div');
        twitterAssistantContainer.classList.add('twitter-assistant-container');

        const tweetMine = TweetMine([], '');
        React.renderComponent(TwitterAssistant( {tweetMine: tweetMine} ), twitterAssistantContainer);
        
        rightProfileSidebar.insertBefore(twitterAssistantContainer, rightProfileSidebar.firstChild);

        return twitterAssistantContainer;
    }).catch(err => {
        console.error('twitterAssistantContainerP error', String(err));
    });

    const users = new Map();
    let tweetMine;
    
    function askUsers(userIds){
        self.port.emit('ask-users', userIds);
    }
    
    self.port.on('answer-users', receivedUsers => {
        for(let u of receivedUsers)
            users.set(u.id_str, u);

        twitterAssistantContainerP.then(twitterAssistantContainer => {
            React.renderComponent(TwitterAssistant({
                tweetMine: tweetMine,
                users: users,
                askUsers : askUsers
            }), twitterAssistantContainer);
        });
    });
    
    self.port.on('twitter-user-data', data => {

        let {user: username, timeline} = data;
        tweetMine = TweetMine(timeline, username);

        twitterAssistantContainerP.then(twitterAssistantContainer => {

            React.renderComponent(TwitterAssistant({
                tweetMine: tweetMine,
                users: users,
                askUsers : askUsers
            }), twitterAssistantContainer);

        }).catch(function(err){
            console.error('metrics integration error', String(err));
        });
    });
    
})();