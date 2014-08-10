'use strict';

// IMPORTS
const { store, search, remove } = require("sdk/passwords");

function preparePasswords(credentials){
    if(!Array.isArray(credentials))
        credentials = [credentials];
    
    return {
        passwordsStoredP: Promise.all(credentials.map(cred => {
            return new Promise( (resolve, reject) => {
                store({
                    username: cred.username,
                    password: cred.password,
                    url: cred.url,
                    formSubmitURL: cred.url,
                    
                    onComplete: resolve,
                    onError: reject
                });
            } );
        })).catch(err => {
            console.error('failed to store passwords', err);
            throw err;
        }),
        
        cleanupPasswords: function(){
            return Promise.all(credentials.map(cred => {
                return new Promise( (resolve, reject) => {
                    remove({
                        username: cred.username,
                        password: cred.password,
                        url: cred.url,
                        formSubmitURL: cred.url,
                        
                        onComplete: resolve,
                        onError: reject
                    });
                } );
            })).catch(err => {
                console.error('failed to cleanup passwords', err);
                throw err;
            });
        }
    };
}

const retrieveDevTwitterUserCredentials = require('./retrieveDevTwitterUserCredentials.js');


// TESTS
exports["test * Basic tests"] = function(assert) {
    assert.strictEqual(typeof retrieveDevTwitterUserCredentials, "function",
                       "retrieveDevTwitterUserCredentials should be a function");
    assert.strictEqual(Object.prototype.toString.call(retrieveDevTwitterUserCredentials("yo")), "[object Promise]");
    
    assert.throws(() => {retrieveDevTwitterUserCredentials()}, Error, "the function throws if called with no args");
};

exports["test * No stored password"] = function(assert, done) {
    
    retrieveDevTwitterUserCredentials("azerty")
        .then(credentials => {
            assert.strictEqual(credentials, undefined,
                "if no passwords are stored, retrieveDevTwitterUserCredentials should return a promise for undefined");
        })
        .catch(err => {
            assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is no matching password");
        })
        .then(done).catch(done);
};


exports["test * No relevant password stored"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "azerty",
            password: "azerty",
            url: "http://www.example.com"
        },
        {
            username: "mlkjh",
            password: "mlkjh",
            url: "https://google.com"
        },
        {
            username: "azerty",
            password: "azerty",
            url: "http://facebook.lol"
        },
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
        
            return retrieveDevTwitterUserCredentials("azerty")
                .then(credentials => {
                    assert.strictEqual(credentials, undefined,
                        "if no relevant passwords are stored, retrieveDevTwitterUserCredentials should return a promise for undefined");
                })
                .catch(err => {
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is no matching password");
                });
        
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
    
};

        
exports["test * One matching password available for https://dev.twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "azerty",
            password: "blabla",
            url: "https://dev.twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("azerty")
                .then(credentials => {
                    assert.ok(Array.isArray(credentials));
                    assert.strictEqual(credentials.length, 1);
                    assert.strictEqual(credentials[0].username, "azerty");
                    assert.strictEqual(credentials[0].password, "blabla");
                })
                .catch(err => { 
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is a password");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};


exports["test * One non-matching password available for https://dev.twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "clochix",
            password: "blabla",
            url: "https://dev.twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("azerty")
                .then(credentials => {
                    assert.strictEqual(credentials, undefined);
                })
                .catch(err => { 
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is a password");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};


exports["test * One matching password available for http://dev.twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "papapapa",
            password: "bloublou",
            url: "http://dev.twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("papapapa")
                .then(credentials => {
                    assert.ok(Array.isArray(credentials));
                    assert.strictEqual(credentials.length, 1);
                    assert.strictEqual(credentials[0].username, "papapapa");
                    assert.strictEqual(credentials[0].password, "bloublou");
                })
                .catch(err => { 
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is a password");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};

exports["test * One password available for https://twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "oooo",
            password: "mmmm",
            url: "https://twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("oooo")
                .then(credentials => {
                    assert.ok(Array.isArray(credentials));
                    assert.strictEqual(credentials.length, 1);
                    assert.strictEqual(credentials[0].username, "oooo");
                    assert.strictEqual(credentials[0].password, "mmmm");
                })
                .catch(err => { 
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is a password");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};

exports["test * One non-matching password available for https://twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "oncletom",
            password: "mmmm",
            url: "https://twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("oooo")
                .then(credentials => {
                     assert.strictEqual(credentials, undefined);
                })
                .catch(err => { 
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject when there is a password");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};


exports["test * Two passwords for https://dev.twitter.com"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "DavidBruant",
            password: "toto",
            url: "https://dev.twitter.com"
        },
        {
            username: "Twikito",
            password: "titi",
            url: "https://dev.twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("DavidBruant")
                .then(credentials => {
                    assert.ok(Array.isArray(credentials));
                    assert.strictEqual(credentials.length, 1);
                    assert.strictEqual(credentials[0].username, "DavidBruant");
                    assert.strictEqual(credentials[0].password, "toto");
                })
                .catch(err => {
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};

exports["test * One password for https://dev.twitter.com and https://twitter.com"] = function(assert, done) {
    /*
        Warning: this test may pass because of a race condition
    */
    
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "DavidBruant",
            password: "no-dev",
            url: "https://twitter.com"
        },
        {
            username: "DavidBruant",
            password: "with-dev",
            url: "https://dev.twitter.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("DavidBruant")
                .then(credentials => {
                    assert.ok(Array.isArray(credentials));
                    assert.strictEqual(credentials.length, 1);
                    assert.strictEqual(credentials[0].username, "DavidBruant");
                    assert.strictEqual(credentials[0].password, "with-dev",
                        "should pick the https://dev.twitter.com password in priority");
                })
                .catch(err => {
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};


/*
exports["test TEMPLATE"] = function(assert, done) {
    // setup
    const {passwordsStoredP, cleanupPasswords} = preparePasswords([
        {
            username: "azerty",
            password: "azerty",
            url: "http://www.example.com"
        }
    ]);
        
    passwordsStoredP
        .then(() => {
            // test
            return retrieveDevTwitterUserCredentials("USERNAME")
                .then(credentials => {
                })
                .catch(err => {
                    assert.fail("retrieveDevTwitterUserCredentials shouldn't reject");
                });
        })
        .then(() => {
            // teardown
            return cleanupPasswords();
        }).then(done).catch(done);
};
*/


require("test").run(exports);
