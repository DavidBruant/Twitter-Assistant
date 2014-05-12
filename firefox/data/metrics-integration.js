'use strict';

var RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

var documentReadyP = new Promise( resolve => {
    document.addEventListener('DOMContentLoaded', function listener(){
        resolve(document);
        document.removeEventListener('DOMContentLoaded', listener);
    });
});

//var ONE_DAY = 24*60*60*1000; // ms

// put the div ASAP so the user knows Twitter Assistant exists
var twitterAssistantMetricsDivP = documentReadyP.then(document => {
    console.log('ready to integrate metrics')
    var rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
    if(!rightProfileSidebar){
        var msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
        throw new Error(msg);
    }

    var twitterAssistantMetricsDiv = document.createElement('div');
    twitterAssistantMetricsDiv.classList.add('twitter-assistant');
    twitterAssistantMetricsDiv.innerHTML = '<h1>Twitter Assistant</h1>';

    rightProfileSidebar.insertBefore(twitterAssistantMetricsDiv, rightProfileSidebar.firstChild);
    
    return twitterAssistantMetricsDiv;
});

twitterAssistantMetricsDivP.catch(err => {
    console.error('twitterAssistantMetricsDivP error', String(err));
});

self.port.on('twitter-user-stats', stats => {
    /*
    {
        tweetsConsidered: number,
        retweetsCount: number,
        tweetsWithLinkCount: number
    }
    */
    console.log('received stats from addon', stats);
    
    twitterAssistantMetricsDivP.then(twitterAssistantMetricsDiv => {
        console.log('ready to integrate metrics');

        var retweetPercent = (stats.retweetsCount/stats.tweetsConsidered)*100;
        var tweetsWithLinkPercent = (stats.tweetsWithLinkCount/stats.tweetsConsidered)*100;
        
        var metricsHTML = '<h2>Over the last '+stats.tweetsConsidered+' tweets</h2>' +
            '<span>Retweets: '+stats.retweetsCount+' ('+retweetPercent.toFixed(1)+'%)</span><br>' +
            '<span>Tweets with link: '+stats.tweetsWithLinkCount+' ('+tweetsWithLinkPercent.toFixed(1)+'%)</span>';
        
        twitterAssistantMetricsDiv.insertAdjacentHTML('beforeend', metricsHTML);
        
    }).catch(function(err){
        console.error('metrics integration error', String(err));
    });
    
    
})