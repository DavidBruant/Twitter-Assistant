(function(){
    'use strict';

    /*
    Need self.options in the form of 
    {
        // needs to be globally unique and below 32 chars
        name: string, 
        // 10-200 chars
        description: string,
        website: string
    }
    */
    if(!self.options){
        throw new Error('need options in fillInAppCreationForm');
    }

    const {name, description, website} = self.options;
    //console.log('credentials from inside', username);

    const appCreationForm = document.querySelector('form#twitter-apps-create-form');

    const nameInput = appCreationForm.querySelector('#edit-app-details input#edit-name');
    const descriptionInput = appCreationForm.querySelector('#edit-app-details input#edit-description');
    const websiteInput = appCreationForm.querySelector('#edit-app-details input#edit-url');

    // Agreeing to https://dev.twitter.com/terms/api-terms
    const tosCheckbox = appCreationForm.querySelector('#edit-tos input[type="checkbox"]#edit-tos-agreement');

    const inputSubmit = appCreationForm.querySelector('input[type="submit"]');

    nameInput.value = name;
    descriptionInput.value = description;
    websiteInput.value = website;

    // make sure to inform the user they're agreeing to https://dev.twitter.com/terms/api-terms
    // simulate a click (might be important like for the submit)
    tosCheckbox.click();


    setTimeout(() => {
        // simulate a click since it seems important (appCreationForm.submit() isn't enough apparently)
        inputSubmit.click();              
    }, 5*1000);

})();
