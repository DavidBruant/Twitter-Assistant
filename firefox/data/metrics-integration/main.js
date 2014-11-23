
const ONE_DAY = 24*60*60*1000; // ms

(function(){
    'use strict';

    const RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

    const twitterAssistantContainerP = (new Promise( resolve => {
        document.addEventListener('DOMContentLoaded', function listener(){
            resolve(document);
            document.removeEventListener('DOMContentLoaded', listener);
        });
    })).then(document => {
        const rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
        if(!rightProfileSidebar){
            const msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
            throw new Error(msg);
        }
        
        const twitterAssistantContainer = document.createElement('div');
        twitterAssistantContainer.classList.add('twitter-assistant-container');
        rightProfileSidebar.insertBefore(twitterAssistantContainer, rightProfileSidebar.firstChild);

        return twitterAssistantContainer;
    }).catch(err => {
        console.error('twitterAssistantContainerP error', String(err));
    });

    const users = new Map();
    let timeline = [];
    let currentUser;
    
    function updateTwitterAssistant(){
        return twitterAssistantContainerP.then(twitterAssistantContainer => {
            React.renderComponent(TwitterAssistant({
                tweetMine: TweetMine(
                    timeline,
                    currentUser ? currentUser.screen_name : ''
                ),
                users: users,
                currentUser: currentUser,
                askUsers: function askUsers(userIds){
                    self.port.emit('ask-users', userIds);
                }
            }), twitterAssistantContainer);
        }).catch(function(err){
            console.error('metrics integration error', String(err));
            throw err;
        });
    }
    
    self.port.on('answer-users', receivedUsers => {
        for(let u of receivedUsers)
            users.set(u.id_str, u);

        updateTwitterAssistant();
    });
    
    self.port.on('current-user-details', currentUserDetails => {
        currentUser = currentUserDetails;
        
        updateTwitterAssistant();
    });
    
    self.port.on('twitter-user-data', _timeline => {
        timeline = _timeline;

        updateTwitterAssistant();
    });
    
    
    // Initial "empty" rendering ASAP so the user knows Twitter Assistant exists
    updateTwitterAssistant();
    
})();