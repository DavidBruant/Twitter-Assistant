"use strict";

const {key, secret} = self.options;
    
console.log('autofill-credential-form API credentials', key, secret);

// variables defined in credentialsPanel.js
keyInput.value = key;
secretInput.value = secret;

// cannot submit https://bugzilla.mozilla.org/show_bug.cgi?id=1031421
//credentialsForm.submit();
// have to submit manually for now I guess...