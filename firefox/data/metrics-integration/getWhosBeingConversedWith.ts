"use strict";

/*
    t is a tweet that is a conversation with someone.
    This function return who... or at least does its best
*/
function getWhosBeingConversedWith(t: TwitterAPITweet){
    let userId : TwitterUserId;
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
            const mentionedUser = t.entities.user_mentions.find(um => um.indices[0] <= 1);
            userId = mentionedUser && mentionedUser.id_str;
        }
    }
    else{
        userId = t.in_reply_to_user_id_str;
    }
    
    return userId;
}

export = getWhosBeingConversedWith