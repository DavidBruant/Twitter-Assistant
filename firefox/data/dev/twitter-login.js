"use strict";

self.port.on('twitter-credentials', function(credentials){
    const {username, password} = credentials;
    //console.log('credentials from inside', username);
        
    const signinForm = document.querySelector('.front-signin form');

    const usernameInput = signinForm.querySelector('.username input');
    const passwordInput = signinForm.querySelector('.password input[type="password"]');

    const submitButton = signinForm.querySelector('button[type="submit"]')
    
    usernameInput.value = username;
    passwordInput.value = password;

    console.log(usernameInput.value, passwordInput.value)
    
    //signinForm.submit();
    setTimeout( () => {
        //signinForm.submit(); 
        submitButton.click();
    }, 2*1000);
    
});