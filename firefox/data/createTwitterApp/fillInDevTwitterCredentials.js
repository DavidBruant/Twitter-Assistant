'use strict';

/*
Need self.options in the form of 
{
    username: string,
    password: string
}

*/
if(!self.options){
    throw new Error('need options in fillinDevTwitterCredentials');
}

const {username, password} = self.options;
//console.log('credentials from inside', username);

const signinForm = document.querySelector('form#user-login');

const usernameInput = signinForm.querySelector('input#edit-name');
const passwordInput = signinForm.querySelector('input[type="password"]');

usernameInput.value = username;
passwordInput.value = password;

signinForm.submit(); 