// <reference path="../typings/request/request.d.ts"/>

"use strict";

import request = require('request');
import qs = require('querystring');

import express = require('express');
import compression = require('compression');
import bodyParser = require('body-parser');
import uuid = require('node-uuid');
import oauthSign = require('oauth-sign');

import oauthCredentials = require('./oauthCredentials.json');

Object.freeze(oauthCredentials); // preventive

interface OauthData{
    consumer_key: string,
    consumer_secret: string,
    token: string,
    token_secret: string,
    verifier: string
}

// TODO remove when all clients have moved to the signing version 
const oauthTokenToOauthData = new Map<string, OauthData>();

const app = express();
app.disable("x-powered-by");
app.disable("etag");

app.use(bodyParser.json({limit: "1mb"})); // for parsing application/json
app.use(compression());


/** 
 * TODO remove when all clients have moved to /twitter/oauth/request_token/direct
 * 
 */
app.post('/twitter/oauth/request_token', function(req, res){
    const callbackURL = req.body.callbackURL;
    console.log('callbackURL', callbackURL)
    // fresh object at each request
    const oauth = Object.assign({callback_url: encodeURIComponent(callbackURL)}, oauthCredentials);
    
    request.post(
        {
            url: 'https://api.twitter.com/oauth/request_token',
            oauth: oauth
        },
        function(err, response, body){
            if(err){
                res.status(502);
                res.send('Error discussing with Twitter (request_token): '+String(err));
                return;
            }

            console.log('status from Twitter request_token', response.statusCode, body);

            // Ideally, you would take the body in the response
            // and construct a URL that a user clicks on (like a sign in button).
            // The verifier is only available in the response after a user has
            // verified with twitter that they are authorizing your app.

            // step 2
            const oauthTokenResponse = qs.parse(body);
            const token = oauthTokenResponse.oauth_token;
            oauthTokenToOauthData.set(token, Object.assign(
                {
                    token: token,
                    token_secret: oauthTokenResponse.oauth_token_secret
                },
                oauthCredentials
            ));

            const twitterAuthenticateURL = [
                'https://api.twitter.com/oauth/authenticate',
                '?',
                qs.stringify({oauth_token: token})
            ].join('');

            res.send(twitterAuthenticateURL);
        }
    )
});

/**
 * New request token that returns the https://api.twitter.com/oauth/request_token response directly
 *
 */
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



/**
 * Now that we're not using the application-only oauth, this is certainly useless
 * Change to only do res.send(''); when everyone has moved to a signing server
 */
app.get('/twitter/callback', function(req, res){
    const query = req.query;
    const token = query.oauth_token;
    const verifier = query.oauth_verifier;
    
    const oauthData = oauthTokenToOauthData.get(token);
    
    oauthData.token = token; // "useless" because it should be the same value
    oauthData.verifier = verifier; // "useless" because it should be the same value
    
    request.post(
        {
            url: 'https://api.twitter.com/oauth/access_token',
            oauth: oauthData
        },
        function(err, response, body){
            if(err){
                res.status(502);
                res.send('Error discussing with Twitter (access_token): '+String(err));
                return;
            }

            console.log('status from Twitter access_token', response.statusCode, body);

            const finalOauthData = qs.parse(body);
            
            delete oauthData.verifier; // not necessary any longer
            oauthData.token = finalOauthData.oauth_token;
            oauthData.token_secret = finalOauthData.oauth_token_secret;
            
            res.status(200);
            res.send('');
        }
    );
});


/*
    Generic route that forwards to the Twitter API and back

    TODO remove this route when every TA user has moved to a version that uses the signing endpoint
*/
app.post('/twitter/api', (req, res) => {
    const body = req.body;
    
    const url = body.url;
    const parameters = body.parameters;
    const token = body.token;
    
    const oauth = oauthTokenToOauthData.get(token);
    
    console.log('/twitter/api', url, parameters, oauth);

    if(!oauth){
        res.status(403);
        res.send('Unknown token: '+token);
        return;
    }
        
    // sending request to Twitter and forwarding back to addon directly
    request.get({ url: url, oauth: oauth, qs: parameters, json: true }).pipe(res);
});


/*
    Generic route that oauth-signs Twitter API call
*/
app.post('/oauth/sign', (req, res) => {
    const body = req.body;

    const method = body.method || 'GET';
    const url = body.url;
    const query = body.query || {};
    const oauth = body.oauth;

    console.log('/oauth/sign', method, url, query, oauth);

    const signatureOauthParams = {  
        oauth_version:          oauth.oauth_version          || '1.0',
        oauth_signature_method: oauth.oauth_signature_method || 'HMAC-SHA1',
        oauth_nonce:            oauth.oauth_nonce            || uuid().replace(/-/g, ''),
        oauth_timestamp:        oauth.oauth_timestamp        || Math.ceil( Date.now() / 1000 ).toString(),
        oauth_token:            oauth.oauth_token,
        oauth_consumer_key:     oauthCredentials.consumer_key
    }
    

    // sending back signature
    res.header('Content-Type', 'text/plain');
    res.send(oauthSign.sign(
        signatureOauthParams.oauth_signature_method,
        method,
        url,
        Object.assign(
            {},
            signatureOauthParams,
            query
        ),
        oauthCredentials.consumer_secret,
        oauth.oauth_token_secret
    ))
});




app.listen('3737', function(){
    console.log('listening', 'http://localhost:3737/')
});

process.on('uncaughtException', e => console.error('Uncaught', e));