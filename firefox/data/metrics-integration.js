'use strict';

const RIGHT_PROFILE_SIDEBAR_SELECTOR = '.ProfileSidebar .ProfileWTFAndTrends';

const documentReadyP = new Promise( resolve => {
    document.addEventListener('DOMContentLoaded', function listener(){
        resolve(document);
        document.removeEventListener('DOMContentLoaded', listener);
    });
});

let ONE_DAY = 24*60*60*1000; // ms

// put the div ASAP so the user knows Twitter Assistant exists
const twitterAssistantMetricsDivP = documentReadyP.then(document => {
    console.log('ready to integrate metrics')
    const rightProfileSidebar = document.body.querySelector(RIGHT_PROFILE_SIDEBAR_SELECTOR);
    if(!rightProfileSidebar){
        const msg = ['No element matching (', RIGHT_PROFILE_SIDEBAR_SELECTOR ,'). No idea where to put the results :-('].join('');
        throw new Error(msg);
    }

    const twitterAssistantMetricsDiv = document.createElement('div');
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
    
    let {user: username, timeline} = data;
    data = undefined;
    const {append, tweetMine} = makeTweetMine(timeline, username);
    timeline = undefined;
    
    
    const oldestTweet = tweetMine.getOldestTweet();
    
    const daysSinceOldestTweet = Math.round( (Date.now() - new Date(oldestTweet.created_at))/ONE_DAY );
    
    
    
    const stats = {
        tweetsConsidered: tweetMine.length,
        retweetsCount: tweetMine.getRetweets().length,
        tweetsWithLinkCount: tweetMine.getTweetsWithLinks().length
    };
    

    twitterAssistantMetricsDivP.then(twitterAssistantMetricsDiv => {
        console.log('ready to integrate metrics');

        const retweetPercent = (stats.retweetsCount/stats.tweetsConsidered)*100;
        const tweetsWithLinkPercent = (stats.tweetsWithLinkCount/stats.tweetsConsidered)*100;
        
        
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
        
        const HISTOGRAM_SIZE = 30;
        const MAX_TWEETS_PER_DAY = 10;
        
        const twitterAssistantContent = '<h2>Last '+daysSinceOldestTweet+' days activity ('+stats.tweetsConsidered+' tweets)</h2>' +
            '<div class="histo-range">' +
                (
                    Array(30).fill(0).map((e, i) => {
                        let today = (new Date()).getTime();
                        today = today - today%ONE_DAY; // beginning of today
                        
                        const thisDayTweets = tweetMine.byDateRange(today - i*ONE_DAY, today - (i-1)*ONE_DAY);
                        
                        const height = Math.min(thisDayTweets.length/MAX_TWEETS_PER_DAY , 1)*100;
                        // TODO add a class when > 1
                        return '<div style="height: '+ height +'%;"></div>'
                    }).reverse().join('')
                ) +
            '</div>' + 
            '<div class="legend">' + 
                '<div>'+HISTOGRAM_SIZE+' days ago</div>' +
                '<div>today</div>' + 
            '</div>' + 
            '<h3>Timeline composition</h3>' +
            '<div class="all-metrics">' +
                '<div class="metrics">' +
                    '<div class="name">Retweets</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+retweetPercent.toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="metrics">' +
                    '<div class="name">Conversations</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+
                            (tweetMine.getConversations().length*100/tweetMine.length).toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="metrics">' +
                    '<div class="name" title="non-media links">With link</div>' +
                    '<div class="fraction-container">' +
                        '<div class="value" style="width: '+tweetsWithLinkPercent.toFixed(1)+'%;"></div>' +
                    '</div>' +
                '</div>' +
            '</div>';
            
            
            /*'<span>Retweets: '+stats.retweetsCount+' ('+retweetPercent.toFixed(1)+'%)</span><br>' +
            '<span>Tweets with link: '+stats.tweetsWithLinkCount+' ('+tweetsWithLinkPercent.toFixed(1)+'%)</span>';*/
        
        twitterAssistantMetricsDiv.insertAdjacentHTML('beforeend', twitterAssistantContent);
        
    }).catch(function(err){
        console.error('metrics integration error', String(err));
    });
    
    
})