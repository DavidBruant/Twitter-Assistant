
/**
 * When a tab opens with Twitter with a user account besides the current user,
 * 1) figure out if the user is followed
 * 2) compute metrics over the last x months
 * 
 */

var tabs = require('tabs');
var isTwitterProfileURL = require('isTwitterProfileURL.js');

exports.main = function() {
    "use strict";
    
    tabs.on('ready', function(t){
        if(isTwitterProfileURL(t.url) && t === tabs.activeTab){
            // go ahead and fetch shit  make computations, display metrics
            //addTwitterMetrics(t, "Timeline contribution", 1235)
            addTwitterMetrics(t, "grrr", '54%')
            //addTwitterMetrics(t, "ekfjzmof", 78)
        }
    });
};



function addTwitterMetrics(tab, name, value){
    tab.attach({
        contentScript:
            'var target = document.querySelector("ul.js-mini-profile-stats");\n'+
            'target.innerHTML += "'+
                '<li>'+
                    '<a class=\\"js-nav\\" data-nav=\\"profile\\">'+
                        '<strong>'+value+'</strong>'+
                        name+
                    '</a>'+
                '</li>";'
    })
    
}