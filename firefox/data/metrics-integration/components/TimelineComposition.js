(function(exports){
    'use strict';
    
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
        
        for(let t of conversationTweets){
            // for now, only keep the first mentionned user
            
            // getting in_reply_to_user_id_str instead of looking inside entities because entities
            // is empty if the user conversed to recently changed of screen_name
            const userId = t.in_reply_to_user_id_str;
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
                        percent: linkPercent
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
