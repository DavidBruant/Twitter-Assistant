"use strict";

var ui =  require("sdk/ui");
var Panel =  require("sdk/panel").Panel;
var data =  require("sdk/self").data;
var pageMod = require("sdk/page-mod");

var getusertimeline = require('getusertimeline.js'); 

var prefs = require('sdk/simple-prefs').prefs

var name = "sdk.console.logLevel";


exports.main = function(){
    
    prefs["sdk.console.logLevel"] = 'all';
    
    var tokenPanel = Panel({
        width: 650,
        height: 150, 
        contentURL:data.url('token.html')
    });
    
    var action_button = ui.ActionButton({
        id: "glovesmore",
        label: "enter oauth Twitter tokens",
        icon:data.url('images/Twitter_logo_blue.png'),
        onClick: function(state) {
            tokenPanel.show({position:action_button});
        }
    });
    
    var pm = pageMod.PageMod({
        include: /^https?:\/\/twitter\.com\/([^\/]+)\/?$/,
        
        contentScriptFile: data.url("metrics-integration.js"),
        contentScriptWhen: "start", // mostly so the attach event happens as soon as possible
        
        contentStyleFile: data.url("metrics-integration.css")
    });
    
    pm.on('attach',function(worker){
        var matches = worker.url.match(/^https?:\/\/twitter\.com\/([^\/]+)\/?$/);
        var user;
        
        if(!Array.isArray(matches) || matches.length < 2)
            return;
        
        user = matches[1];
        console.log('user', user);
        getusertimeline(user).then(function(timeline){
            //console.log(timeline); 
            
            var RTs = timeline.filter(function(tweet){
                return 'retweeted_status' in tweet;
            });
            
            worker.port.emit('twitter-user-stats', {
                tweetsConsidered: timeline.length,
                retweetsCount: RTs.length
            });
            
        }).catch( err => {
            console.error('error while getting the user timeline', user, err);
        });
        
    })
    
    
    
    
};

