"use strict";

self.port.on('twitter-credentials', function(credentials){
    const {username, password} = credentials;
    //console.log('credentials from inside', username);
        
    const signinForm = document.querySelector('form.signin');

    const usernameInput = signinForm.querySelector('.username input');
    const passwordInput = signinForm.querySelector('.password input[type="password"]');

    usernameInput.value = username;
    passwordInput.value = password;

    signinForm.submit(); 
    
});