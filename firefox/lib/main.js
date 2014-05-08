"use strict";

var ui =  require("sdk/ui");
var Panel =  require("sdk/panel").Panel;
var data =  require("sdk/self").data;

var getusertimeline = require('getusertimeline.js'); 

exports.main = function(){
    
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
    
    getusertimeline('KinoSan').then(function(timeline){
        //console.log(timeline); 
    });
    
    
};

