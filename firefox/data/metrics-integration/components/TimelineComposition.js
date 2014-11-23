(function(exports){
    'use strict';
    
    function getDomain(url){
        const a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }
    
    /*
        extract the the original tweet out of a retweet
    */
    function getOriginalTweet(rt){
        var ret = rt;
        
        while(Object(ret.retweeted_status) === ret.retweeted_status)
            ret = ret.retweeted_status;
        
        return ret;
    }
    
    function makeRetweetDetails(retweets){
        const originalTweets = retweets.map(getOriginalTweet);
        const originalTweetsByAuthor = new Map();
        for(let t of originalTweets){
            const userId = t.user.id_str;

            if(!originalTweetsByAuthor.has(userId)){
                originalTweetsByAuthor.set(userId, {
                    count: 0,
                    user: t.user
                });
            }

            originalTweetsByAuthor.get(userId).count++;
        }

        let sortedRetweetedUsers = [...originalTweetsByAuthor.values()]
            .sort((o1, o2) => o1.count < o2.count ? 1 : -1 );

        // keep only the first 10 for now
        sortedRetweetedUsers = sortedRetweetedUsers.slice(0, 10);

        return sortedRetweetedUsers.map(({count, user}) => {
            return {
                amount: count,
                text: user.name,
                url: "https://twitter.com/"+user.screen_name,
                image: user.profile_image_url_https
            }
        });
    }
    
    function makeConversationDetails(conversationTweets, usersDetails){
        const usersConversedWith = new Map();
        //console.log('conversationTweets', conversationTweets)
        //console.log('to myself', conversationTweets.filter(t => t.user.screen_name.toLowerCase() === 'DavidBruant'.toLowerCase()))
        
        for(let t of conversationTweets){
            let userId;
            // for now, only keep the first mentionned user
            
            // getting in_reply_to_user_id_str instead of looking inside entities because entities
            // is empty if the user conversed to recently changed of screen_name
            // (noticed it thanks to @angelinamagnum => @hopefulcyborg)
            // TODO : skip these cases
            
            if(t.in_reply_to_user_id_str === t.user.id_str){
                // If A replies to B and A replies to their own reply as a followup, in_reply_to_user_id_str 
                // refers to B in the first reply, A in the second (which isn't the intention)
                
                if(Array.isArray(t.entities.user_mentions) && t.entities.user_mentions.length >= 1){
                    // <= 1 because sometimes people do ".@DavidBruant blabla bla" to make the reply public
                    userId = t.entities.user_mentions.find(um => um.indices[0] <= 1).id_str;
                }
            }
            else{
                userId = t.in_reply_to_user_id_str;
            }
            
            //console.log('userId', userId, t);
            
            if(!usersConversedWith.has(userId)){
                usersConversedWith.set(userId, {
                    count: 0,
                    userId: userId
                });
            }

            usersConversedWith.get(userId).count++;
        };

        let sortedConversedUsers = [...usersConversedWith.values()]
            .sort((o1, o2) => o1.count < o2.count ? 1 : -1 );
        
        const missingUserIds = sortedConversedUsers
            .map(o => o.userId)
            .filter(id => !usersDetails.has(id));
        
        
        // keep only the first 10 for now
        sortedConversedUsers = sortedConversedUsers.slice(0, 10);
        
        return {
            conversationDetails : sortedConversedUsers.map(({count, userId}) => {

                const userDetails = usersDetails.get(userId);

                return {
                    amount: count,
                    text: userDetails ? userDetails.name : undefined,
                    url: userDetails ? "https://twitter.com/"+userDetails.screen_name : undefined,
                    image: userDetails ? userDetails.profile_image_url_https : undefined
                }
            }),
            missingUsers : missingUserIds.length === 0 ? undefined : missingUserIds
        }
    }
    
    
    
    function makeLinksDetails(tweetsWithLinks){
        const countsByDomain = new Map();
        
        for(let t of tweetsWithLinks){
            for(let urlObj of t.entities.urls){
                let domain = getDomain(urlObj.expanded_url);
                let record = countsByDomain.get(domain);
                
                if(!record){
                    record = {
                        count: 0,
                        tweets: []
                    };
                    
                    countsByDomain.set(domain, record);
                }
                
                record.count++;
                record.tweets.push(t);
            }
        }
        
        let sortedDomains = [...countsByDomain.keys()]
            .sort((d1, d2) => countsByDomain.get(d1).count < countsByDomain.get(d2).count ? 1 : -1 );
        
        // keep only the first 10 for now
        sortedDomains = sortedDomains.slice(0, 10);
        
        return sortedDomains.map(domain => {
            const record = countsByDomain.get(domain);

            return {
                amount: record.count,
                text: domain,
                url: 'http://'+record.domain+'/'
            };
        });
    }
    
    
    exports.TimelineComposition = React.createClass({
        
        render: function(){
            /*
                {
                    tweetMine: TweetMine,
                    users: TwitterAPIUser[],
                    askMissingUsers : usersId[] => void
                }
            */
            const data = this.props;
            const state = this.state;
            
            const {tweetMine, users, askMissingUsers} = data;
            
            const writtenTweets = tweetMine.getNonRetweetNonConversationTweets();
            
            const tweetsWithLinks = writtenTweets.filter(t => {
                try{
                    return t.entities.urls.length >= 1;
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
            const linkPercent = tweetsWithLinks.length*100/tweetMine.length;
            let linkTweetSet = new Set(tweetsWithLinks);
            
            // if a tweet has both a link and a media, the link is prioritized
            const mediaTweets = writtenTweets.filter(t => {
                try{
                    return t.entities.media.length >= 1 && !linkTweetSet.has(t);
                }
                catch(e){
                    // most likely a nested property doesn't exist
                    return false;
                }
            });
            linkTweetSet = undefined;
            const mediaPercent = mediaTweets.length*100/tweetMine.length;
            
            
            const retweets = tweetMine.getRetweets();
            const rtPercent = retweets.length*100/tweetMine.length;
            
            const conversationTweets = tweetMine.getConversations();
            const convPercent = conversationTweets.length*100/tweetMine.length;
            
            const {conversationDetails, missingUsers} = makeConversationDetails(conversationTweets, users);
            
            if(missingUsers){
                askMissingUsers(missingUsers);
            }
            
            return React.DOM.div( {}, [
                Metrics({
                    values : [{
                        class: 'retweets',
                        title: "Retweets",
                        percent: rtPercent,
                        details: makeRetweetDetails(retweets)
                    }, {
                        class: 'conversations',
                        title: "Conversations",
                        percent: convPercent,
                        details: conversationDetails
                    }, {
                        class: 'media',
                        title: "Media",
                        percent: mediaPercent
                    }, {
                        class: 'links',
                        title: "Links",
                        percent: linkPercent,
                        details: makeLinksDetails(tweetsWithLinks)
                    }, {
                        class: 'other',
                        title: "Other",
                        percent: 100 - (rtPercent + convPercent + mediaPercent + linkPercent)
                    }
                ]})
            ]);
        }
    });
        
})(this);
