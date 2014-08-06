(function(){
    'use strict';
    
    const apiKeyRow = document.body.querySelector('.app-settings .row:nth-of-type(1)');
    const apiSecretRow = document.body.querySelector('.app-settings .row:nth-of-type(2)');
    
    if(!apiKeyRow.querySelector('span.heading').textContent.toLowerCase().contains('key'))
        self.emit('error', new Error('assertion broken: first row does not correspond to the API key'));
    
    if(!apiSecretRow.querySelector('span.heading').textContent.toLowerCase().contains('secret'))
        self.emit('error', new Error('assertion broken: first row does not correspond to the API secret'));
    
    self.emit('credentials', {
        key: apiKeyRow.querySelector('span:nth-of-type(2)').textContent.trim(),
        secret: apiSecretRow.querySelector('span:nth-of-type(2)').textContent.trim()
    })
    
})();
