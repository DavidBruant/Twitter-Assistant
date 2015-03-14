'use strict';

import Metrics = require('./Metrics');


function getDomain(url: string){
    var a = document.createElement('a');
    a.href = url;
    return a.hostname;
}

/*
    extract the the original tweet out of a retweet
*/
function getOriginalTweet(rt: TwitterAPITweet){
    var ret = rt;

    while(Object(ret.retweeted_status) === ret.retweeted_status)
        ret = ret.retweeted_status;

    return ret;
}

interface UserCountEntry{
    count: number
    user: TwitterAPIUser
    userId: TwitterUserId // in case the user is missing
}

function makeRetweetDetails(retweets: TwitterAPITweet[], users: Map<TwitterUserId, TwitterAPIUser>){
    var originalTweets = retweets.map(getOriginalTweet);
    var originalTweetsByAuthor = new Map<TwitterUserId, UserCountEntry>();
    originalTweets.forEach( t => {
        var userId = t.user.id_str;

        if(!originalTweetsByAuthor.has(userId)){
            originalTweetsByAuthor.set(userId, {
                count: 0,
                user: users.get(userId),
                userId: userId
            });
        }

        originalTweetsByAuthor.get(userId).count++;
    });

    var sortedRetweetedUsers: UserCountEntry[] = Array.from<UserCountEntry>(originalTweetsByAuthor.values())
        .sort((o1, o2) => o1.count < o2.count ? 1 : -1 );

    // keep only the first 10 for now
    sortedRetweetedUsers = sortedRetweetedUsers.slice(0, 10);
    
    var missingUserIds = sortedRetweetedUsers
        .map(o => o.userId)
        .filter(id => !users.has(id));

    return {
        retweetDetails: sortedRetweetedUsers.map((entry) => {
            var count = entry.count, 
                user = entry.user;

            return {
                amount: count,
                text: user && user.name,
                url: user && ("https://twitter.com/"+user.screen_name),
                image: user && user.profile_image_url_https
            }
        }),
        missingUsers: missingUserIds
    };
}


function makeConversationDetails(conversationTweets: TwitterAPITweet[], users: Map<TwitterUserId, TwitterAPIUser>){
    var usersConversedWith = new Map<TwitterUserId, UserCountEntry>();
    //console.log('conversationTweets', conversationTweets)
    //console.log('to myself', conversationTweets.filter(t => t.user.screen_name.toLowerCase() === 'DavidBruant'.toLowerCase()))

    conversationTweets.forEach(t => {
        var userId: TwitterUserId;
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
                user: users.get(userId),
                userId: userId
            });
        }

        usersConversedWith.get(userId).count++;
    });

    var sortedConversedUsers : UserCountEntry[] = Array.from<UserCountEntry>(usersConversedWith.values())
        .sort((o1, o2) => o1.count < o2.count ? 1 : -1 );

    var missingUserIds = sortedConversedUsers
        .map(o => o.userId)
        .filter(id => !users.has(id));


    // keep only the first 10 for now
    sortedConversedUsers = sortedConversedUsers.slice(0, 10);

    return {
        conversationDetails : sortedConversedUsers.map((entry) => {
            var count = entry.count, 
                user = entry.user;

            return {
                amount: count,
                text: user && user.name,
                url: user && ("https://twitter.com/"+user.screen_name),
                image: user && user.profile_image_url_https
            }
        }),
        missingUsers : missingUserIds
    };
}

interface DomainCountEntry{
    count: number
    tweets: TwitterAPITweet[]
}

function makeLinksDetails(tweetsWithLinks: TwitterAPITweet[]){
    var countsByDomain = new Map<string, DomainCountEntry>();

    tweetsWithLinks.forEach(t => {
        t.entities.urls.forEach(urlObj => {
            var domain = getDomain(urlObj.expanded_url);
            var record = countsByDomain.get(domain);

            if(!record){
                record = {
                    count: 0,
                    tweets: []
                };

                countsByDomain.set(domain, record);
            }

            record.count++;
            record.tweets.push(t);
        });
    });

    var sortedDomains : string[] = (<any>Array).from((<any>countsByDomain).keys())
        .sort((d1:string, d2:string) => countsByDomain.get(d1).count < countsByDomain.get(d2).count ? 1 : -1 );

    // keep only the first 10 for now
    sortedDomains = sortedDomains.slice(0, 10);

    return sortedDomains.map(domain => {
        var record = countsByDomain.get(domain);

        return {
            amount: record.count,
            text: domain,
            url: 'http://'+domain+'/'
        };
    });
}

interface TimelineCompositionProps{
    tweetMine: any // TweetMine
    users: Map<TwitterUserId, TwitterAPIUser>
    askMissingUsers : (ids: TwitterUserId[]) => void
}

var TimelineComposition = React.createClass({

    render: function(){
        var data : TimelineCompositionProps = this.props;
        var state = this.state;

        var tweetMine = data.tweetMine,
            users = data.users, 
            askMissingUsers = data.askMissingUsers;
        
        // console.log('TimelineComposition props users', iterableToArray(users.keys()));

        var writtenTweets : TwitterAPITweet[] = tweetMine.getNonRetweetNonConversationTweets();

        var tweetsWithLinks = writtenTweets.filter(t => {
            try{
                return t.entities.urls.length >= 1;
            }
            catch(e){
                // most likely a nested property doesn't exist
                return false;
            }
        });
        var linkPercent = tweetsWithLinks.length*100/tweetMine.length;
        var linkTweetSet = new (<any>Set)(tweetsWithLinks); // waiting for TS1.4 for proper Set interface

        // if a tweet has both a link and a media, the link is prioritized
        var mediaTweets = writtenTweets.filter(t => {
            try{
                return t.entities.media.length >= 1 && !linkTweetSet.has(t);
            }
            catch(e){
                // most likely a nested property doesn't exist
                return false;
            }
        });
        linkTweetSet = undefined;
        var mediaPercent = mediaTweets.length*100/tweetMine.length;


        var retweets = tweetMine.getRetweets();
        var rtPercent = retweets.length*100/tweetMine.length;

        var conversationTweets = tweetMine.getConversations();
        var convPercent = conversationTweets.length*100/tweetMine.length;

        // looking forward to destructuring in TS 1.5
        var convLeftover = makeConversationDetails(conversationTweets, users);
        var conversationDetails = convLeftover.conversationDetails,
            convMissingUsers = convLeftover.missingUsers;
        
        const rtLeftover = makeRetweetDetails(retweets, users);
        const rtDetails = rtLeftover.retweetDetails,
            rtMissingUsers = rtLeftover.missingUsers;

        const missingUsers = Array.from<TwitterUserId>(new Set(convMissingUsers.concat(rtMissingUsers)));
        
        
        if(missingUsers){
            askMissingUsers(missingUsers);
        }

        return React.DOM.div( {}, [
            Metrics({
                values : [{
                    class: 'retweets',
                    title: "Retweets",
                    percent: rtPercent,
                    details: rtDetails
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
        
export = TimelineComposition;