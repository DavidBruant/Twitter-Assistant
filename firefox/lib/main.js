"use strict";

var Widget =  require("sdk/widget").Widget;
var Panel =  require("sdk/panel").Panel;
var data =  require("sdk/self").data;

var getusertimeline = require('getusertimeline.js'); 

exports.main = function(){
    
    var tokenPanel = Panel({
        width: 650,
        height: 150, 
        contentURL:data.url('token.html')
    });
    
    var twitterWidget = Widget({
        id:"glovesmore",
        label:"enter oauth Twitter tokens",
        contentURL:"https://twitter.com/favicon.ico",
        panel: tokenPanel
    });
    
    getusertimeline('KinoSan').then(function(timeline){
        console.log(timeline); 
    });
    
    
};

