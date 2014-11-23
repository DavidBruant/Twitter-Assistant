(function(){
    'use strict';

    let screenNameElement = document.body.querySelector('.DashboardProfileCard .DashboardProfileCard-screenname');
    console.log('screenNameElement', document.body.querySelectorAll('*').length, screenNameElement);
    console.log('doc innerHTML', document.documentElement.outerHTML);
    
    if(screenNameElement) // .slice(1) to remove the initial @
        self.port.emit('username', screenNameElement.textContent.trim().slice(1));
    else
        self.port.emit('error');
    
})();