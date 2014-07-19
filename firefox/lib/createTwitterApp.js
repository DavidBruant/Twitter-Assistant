"use strict";

const tabs = require("sdk/tabs");
const passwords = require("sdk/passwords");

const retriveDevTwitterUserCredentials = require('retrieveDevTwitterUserCredentials');

const TWITTER_APP_LOGIN_PAGE = "https://dev.twitter.com/user/login?destination=home";


/*
<ul>
    <li><strong>Log you in</strong> with your Twitter login and password (if saved in your web browser) to <a target="_blank" href="https://dev.twitter.com/user/login?destination=home">https://dev.twitter.com/</a></li>
    <li><strong>Create a Twitter app</strong>
    <li><strong>Accept the</strong> <a target="_blank" href="https://dev.twitter.com/terms/api-terms">terms of services</a> ("Developer rules of the road")
    <li>When the app is created, the addon will <strong>fetch the "API key" and "API secret"</strong> from the "API keys" tab.
        </ul>

*/

module.exports = function(){
    
    const devTwitterUserCredentialsP = retriveDevTwitterUserCredentials()
            /*.then(pw => console.log(pw))
            .catch(err => {
                console.error('no credentials from retriveDevTwitterUserCredentials in createTwitterApp ', err)
                throw err;
            });*/
    
    const tabP = new Promise((resolve, reject) => {
        tabs.open(TWITTER_APP_LOGIN_PAGE, {
            onReady: resolve
        });
    });
    
    console.log('created the two promises');
    
    Promise.all([devTwitterUserCredentialsP, tabP])
        .then(function([devTwitterUserCredentials, tab]){
            console.log('ready to login', devTwitterUserCredentials, tab);
        })
        .catch( err => console.error(err) );
    
    
    // fill in the login/password form
    // Promise.all()
    
};

