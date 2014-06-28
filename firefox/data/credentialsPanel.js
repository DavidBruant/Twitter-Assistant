'use strict';

const credentialsForm = document.body.querySelector('form');

const keyInput = credentialsForm.querySelector('input.key');
keyInput.focus();
const secretInput = credentialsForm.querySelector('input.secret');

const errorMessage = document.body.querySelector('.error')

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


credentialsForm.addEventListener('submit', e => {
    e.preventDefault();
    
    console.log('submit event');
    
    var key = keyInput.value,
        secret = secretInput.value;
    
    console.log('form submit', key, secret);
    
    if(!key || !secret || key.length <= 1 || secret.length <= 1)
        return; // ignore
    
    self.port.emit('test-credentials', {key: key, secret: secret});
    
    // TODO add a spinner
});

self.port.on('test-credentials-result', result => {
    var key = keyInput.value,
        secret = secretInput.value;
    
    console.log('test-credentials-result', result);
    
    // TODO remove spinner
    
    // parent context sends back the token if it's valid and whatever else otherwise
    if(Object(result) === result && result.key === key && result.secret === secret){
        self.port.emit('persist-credentials', result);
    }
    else{
        // can happen either if the token is invalid or the user change the input field
        showError();
    }
});

if(self.options){
    keyInput.value = self.options.key;
    secretInput.value = self.options.secret;
}