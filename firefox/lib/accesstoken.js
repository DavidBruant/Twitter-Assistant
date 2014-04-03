'use strict';
// https://dev.twitter.com/docs/auth/application-only-auth
// RFC 1738
var Request = require("sdk/request").Request;
var base64 = require("sdk/base64");
const { defer } = require('sdk/core/promise');

var CONSUMER_KEY = 'mx8hM4RrxyVlrgzBJRA';
var CONSUMER_SECRET = 'Oqcts8SJaBRDfxnlwaefiMSQNVidMmR4gLthkS6c';

var encodedConsumerKey = encodeURIComponent(CONSUMER_KEY);
var encodedConsumerSecret = encodeURIComponent(CONSUMER_SECRET);

var bearerTokenCredentails = encodedConsumerKey + ':' + encodedConsumerSecret;

var b64bearerToken = base64.encode(bearerTokenCredentails);

var accessTokenDef = defer();

Request({
    url: "https://api.twitter.com/oauth2/token",
    headers: {
        'Authorization': 'Basic '+b64bearerToken,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    onComplete: function (response) {
        //console.log('/oauth2/token status', response.status);
        
        accessTokenDef.resolve(response.json.access_token);
        //console.log('accessToken', response.json.access_token);
    },
    content: 'grant_type=client_credentials'
}).post();

module.exports = accessTokenDef.promise;
