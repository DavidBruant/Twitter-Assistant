"use strict";

/*
    extract the the original tweet out of a retweet
*/
function getOriginalTweet(rt: TwitterAPITweet){
    let ret = rt;

    while(Object(ret.retweeted_status) === ret.retweeted_status)
        ret = ret.retweeted_status;

    return ret;
}

export = getOriginalTweet