'use strict';

const data = {
    //automateTwitterAppCreation: e => self.addon.port.emit('automate-twitter-app-creation'),
    //testCredentials: credentials => self.addon.port.emit('test-credentials', credentials)
    signinWithTwitter(){
        self.addon.port.emit('sign-in-with-twitter')
    }
};

function updatePanel(){
    React.renderComponent(TwitterAssistantPanel(data), document.body);
}


self.addon.port.on('logged-in-user', user => {
    data.loggedUser = user;
    delete data.errorMessage;
    updatePanel();
});


self.addon.port.on('error-request-token', error => {
    console.log('panel receiving error', error)
    data.errorMessage =
        "Error trying to reach Twitter (via "+error.twitterAssistantServerOrigin+") "+String(error.message);
    updatePanel();
});




updatePanel();
