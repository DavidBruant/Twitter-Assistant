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

self.port.on('twitter-user-data', data => {
    
    console.log('received data from addon', data);
    
    const username = data.user;
    const timeline = data.timeline;
    

    var RTs = timeline.filter(function(tweet){
        return 'retweeted_status' in tweet;
    });

    var tweetsWithLink = timeline.filter(tweet => {
        try{
            return tweet.entities.urls.length >= 1;
        }
        catch(e){
            // most likely a nested property doesn't exist
            return false;
        }
    });

    var conversations = timeline.filter(tweet => {
        return tweet.user.screen_name === username &&
            !tweet.retweeted_status &&
            tweet.text.startsWith('@'); // a bit weak, but close enough. Would need to check if the user actually exists
    });
    
    
    var oldestTweet = timeline.reduce(function(oldestSoFar, curr){
        var oldestSoFarTimestamp = (new Date(oldestSoFar.created_at)).getTime();
        var currTimestamp = (new Date(curr.created_at)).getTime();
        
        return oldestSoFarTimestamp < currTimestamp ? oldestSoFar : curr;
    });
    
    var daysSinceOldestTweet = Math.round( (Date.now() - new Date(oldestTweet.created_at))/(1000*60*60*24) );
    
    
    var stats = {
        tweetsConsidered: timeline.length,
        retweetsCount: RTs.length,
        tweetsWithLinkCount: tweetsWithLink.length
    };
    

    twitterAssistantMetricsDivP.then(twitterAssistantMetricsDiv => {
        console.log('ready to integrate metrics');

        var retweetPercent = (stats.retweetsCount/stats.tweetsConsidered)*100;
        var tweetsWithLinkPercent = (stats.tweetsWithLinkCount/stats.tweetsConsidered)*100;
        
        
        
        /*
        <h1>Twitter Assistant</h1>
            <h2>April 1st - May 1st 2014 activity</h2>
            <div class="histo-range">
                <div style="height: 40%;"></div>
                <div style="height: 42%;"></div>
                <div style="height: 39%;"></div>
            </div>
            <div class="legend">
                <div>April 1st</div>
                <div>May 1st</div>
            </div>

            <h3>Timeline composition</h3>
            <div class="all-metrics">
                <div class="metrics">
                    <div class="name">Retweets</div>
                    <div class="fraction-container">
                        <div class="value" style="width: 55%;"></div>
                    </div>
                </div>
                <div class="metrics">
                    <div class="name">Links</div>
                    <div class="fraction-container">
                        <div class="value" style="width: 70%;"></div>
                    </div>
                </div>
                <div class="metrics">
                    <div class="name">Conversations</div>
                    <div class="fraction-container">
                        <div class="value" style="width: 4%;"></div>
                    </div>
                </div>
            </div>
            <h4>Most used words</h4>
            <div class="most-used-words">
                <span>Bordeaux</span>
                <span>tour</span>
                <span>vin</span>  
                <span>tourisme</span>
            </div>  

            <h3>Generated Engagement</h3>
            <div class="all-metrics">
                <div class="metrics">
                    <div class="name">Retweets</div>
                    <div class="value">51</div>
                </div>
                <div class="metrics">
                    <div class="name">Favorites</div>
                    <div class="value">55</div>
                </div>
                <div class="metrics">
                    <div class="name">Replies</div>
                    <div class="value">12</div>
                </div>
            </div>
        
        */
        
        
        var metricsHTML = '<h2>Last '+daysSinceOldestTweet+' days activity ('+stats.tweetsConsidered+' tweets)</h2>' +
            '<h3>Timeline composition</h3>' +
            '<div class="all-metrics">' +
                '<div class="metrics">' +
                    '<div class="name">Retweets</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+retweetPercent.toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="metrics">' +
                    '<div class="name" title="non-media links">With link</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+tweetsWithLinkPercent.toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="metrics">' +
                    '<div class="name">Conversations</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+(conversations.length*100/timeline.length).toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
            
            
            /*'<span>Retweets: '+stats.retweetsCount+' ('+retweetPercent.toFixed(1)+'%)</span><br>' +
            '<span>Tweets with link: '+stats.tweetsWithLinkCount+' ('+tweetsWithLinkPercent.toFixed(1)+'%)</span>';*/
        
        twitterAssistantMetricsDiv.insertAdjacentHTML('beforeend', metricsHTML);
        
    }).catch(function(err){
        console.error('metrics integration error', String(err));
    });
    
    
})