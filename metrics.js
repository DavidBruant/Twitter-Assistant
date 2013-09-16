/**
** Assumes there are Tweet and User objects
*/

/**

* tweets per day that you will see
* people who share links already shared otherwise

*/

(function(exports){
    "use strict"; 

    exports.categorizeRecentTweets = function(refUser, consideredUser){
        var consideredTweetsP = consideredUser.getRecentTweets();
        var followedP = refUser.getFollowed();

        return Q.all([consideredTweetsP, followedP]).spread(function(consideredTweets, followed){
            var conversationsWithNotFollowed = [],
                conversationsWithFollowed = [],
                RTOfFollowed = [],
                RTOfNotFollowed = [],
                withLink = [];

            if(followed.indexOf(consideredUser) === -1){
                // not currently following the considered user (measure potential impact on timeline)

                consideredTweets.forEach(function(t){
                    if(t.retweetOf){ // RT
                        
                        if(followed.indexOf(t.retweetOf) !== -1){
                            RTOfFollowed.push(t);
                        }
                        else{
                            RTOfNotFollowed.push(t)
                        }
                    }  
                    else{ // manual tweet
                        if(t.tweetTo){
                            // consideredUser is having a conversation

                            if(followed.indexOf(t.tweetTo) === -1){
                                // with someone not followed by refUser 
                                conversationsWithNotFollowed.push(t)            
                            }
                            else{
                                // with someone followed by refUser
                                conversationsWithFollowed.push(t);
                            }
                        }
                        
                    }

                    if(t.containsLink){
                        // the tweet (RT or manual) contains a link to a webpage
                        withLink.push(t);
                    }
                })
            }
            else{
                // currently following (measure current contribution to timeline)
                throw 'TODO';
            }

            return Object.freeze({
                conversationsWithNotFollowed : conversationsWithNotFollowed,
                conversationsWithFollowed : conversationsWithFollowed,
                RTOfFollowed : RTOfFollowed,
                RTOfNotFollowed : RTOfNotFollowed,
                withLink : withLink,
                all: consideredTweets,

                get potentialContribution(){
                    return this.all.length - (
                        this.RTOfFollowed.length + // cause they're already part of the timeline
                        this.conversationsWithNotFollowed.length); // cause they won't appear
                },
                get withLinkProportion(){
                    return withLink.length/consideredTweets.length;
                }
            });
        }
    };

})(this);
