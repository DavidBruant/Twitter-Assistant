'use strict';

const titleUsername = document.body.querySelector('h2 .username');

const apiCredentialsForm = document.body.querySelector('form.api-credentials');
const keyInput = apiCredentialsForm.querySelector('input.key');
keyInput.focus();
const secretInput = apiCredentialsForm.querySelector('input.secret');

const errorMessage = apiCredentialsForm.querySelector('.error')

const automaticButton = document.body.querySelector('button.automatic');
const manualButton = document.body.querySelector('button.manual');

const userCredentialsForm = document.body.querySelector('form.user-credentials');
const usernameInput = userCredentialsForm.querySelector('input.username');
const passwordInput = userCredentialsForm.querySelector('input.password');


function hideError(){
    errorMessage.setAttribute('hidden', 'hidden');
    keyInput.removeEventListener('input', hideError);
    secretInput.removeEventListener('input', hideError);
}

function showError(){
    errorMessage.removeAttribute('hidden');
        
    keyInput.addEventListener('input', hideError);
    secretInput.addEventListener('input', hideError);
}

apiCredentialsForm.addEventListener('submit', e => {
    e.preventDefault();
    
    var key = keyInput.value,
        secret = secretInput.value;
    
    console.log('form submit', key, secret);
    
    if(!key || !secret || key.length <= 1 || secret.length <= 1)
        return; // ignore
    
    self.port.emit('test-credentials', {key: key, secret: secret});
    
    // TODO add a spinner
});

userCredentialsForm.addEventListener('submit', function submitListener(e){
    self.port.emit('automate-twitter-app-creation', {
        username: usernameInput.value,
        password: passwordInput.value
    });
} );

automaticButton.addEventListener('click', e => {
    document.body.querySelector('.instructions.automatic').removeAttribute('hidden');
    document.body.querySelector('.instructions.manual').setAttribute('hidden', '');
    
    if(userCredentialsForm.getAttribute('hidden') !== null){
        // form is hidden, we already have the password, no need to ask for it.
        self.port.emit('automate-twitter-app-creation');
    }
});

manualButton.addEventListener('click', e => {
    document.body.querySelector('.instructions.manual').removeAttribute('hidden');
    document.body.querySelector('.instructions.automatic').setAttribute('hidden', '');
});

self.port.on('test-credentials-result', result => {
    var key = keyInput.value,
        secret = secretInput.value;
    
    console.log('test-credentials-result', result);
    
    // TODO remove spinner
    
    // parent context sends back the token if it's valid and whatever else otherwise
    if(Object(result) === result && result.key === key && result.secret === secret){
        self.port.emit('confirm-credentials', result);
    }
    else{
        // can happen either if the token is invalid or the user change the input field
        showError();
    }
});

self.port.on('update-username', username => {
    titleUsername.textContent = username;
    usernameInput.value = username;
});

self.port.on('update-password-already-available', () => {
    userCredentialsForm.setAttribute('hidden', '');
});


if(self.options){
    keyInput.value = self.options.key;
    secretInput.value = self.options.secret;
}