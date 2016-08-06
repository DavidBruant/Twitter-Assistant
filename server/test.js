"use strict";

var request = require('request');

/**
app.post('/twitter/oauth/request_token/direct', function(req, res){
    
    request.post({
        url: 'https://api.twitter.com/oauth/request_token',
        oauth: Object.assign(
            { callback_url: encodeURIComponent(req.body.callbackURL) },
            oauthCredentials
        )
    })
    .pipe(res);

});
 * 
 */


/**
app.post('/twitter/sign', (req, res) => {
    const body = req.body;
    
    const method = body.method || 'GET';
    const url = body.url;
    const parameters = body.parameters || {};
    const oauth = body.oauth;
 * 
 */


console.log('Test 1')
request.post(
    {
        url: 'http://localhost:3737/oauth/sign',
        json: {
            method: 'GET',
            url: 'https://api.twitter.com/lol',
            query: {
                user_id: '1234567890'
            },
            oauth: {
                oauth_token: Math.random().toString(36).slice(2),
                oauth_token_secret: Math.random().toString(36).slice(2)
            }
        }
    },
    function(err, response, body){
        if(err){
            console.error('Been received with an error', err)
            return;
        }

        if(response.statusCode !== 200){
            console.error('HTTP status code', response.statusCode, body)
            return;
        }

        console.log('Signature:', body);
        console.log('Passed!')
    }
);




console.log('Test 2');
request.post(
    {
        url: 'http://localhost:3737/twitter/oauth/request_token/direct',
        json: {
            callbackURL: 'http://localhost:3737/twitter/callback'
        }
    },
    function(err, response, body){
        if(err){
            console.error('Been received with an error', 'http://localhost:3737/twitter/oauth/request_token/direct', err)
            return;
        }

        if(response.statusCode !== 200){
            console.error('HTTP status code', response.statusCode, body)
            return;
        }

        console.log('body', body);

        var oauth = JSON.parse(body);

        //delete oauth.callback_confirmed;

        request.post(
            {
                url: 'http://localhost:3737/oauth/sign',
                json: {
                    method: 'GET',
                    url: 'https://api.twitter.com/lol',
                    query: {
                        user_id: '1234567890'
                    },
                    oauth: oauth
                }
            },
            function(err, response, body){
                if(err){
                    console.error('Been received with an error', 'http://localhost:3737/oauth/sign', err)
                    return;
                }

                if(response.statusCode !== 200){
                    console.error('HTTP status code', response.statusCode, body)
                    return;
                }

                console.log('Signature:', body);
                console.log('Passed!')
            }
        );
    }
);