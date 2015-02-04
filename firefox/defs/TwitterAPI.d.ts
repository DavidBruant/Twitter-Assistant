
interface TwitterAPI_I {
    /*
        https://dev.twitter.com/rest/reference/get/statuses/user_timeline
        endpoint: https://api.twitter.com/1.1/statuses/user_timeline.json

        maxId: the caller needs to substract 1
        https://dev.twitter.com/docs/working-with-timelines
        ... or not:
        "Environments where a Tweet ID cannot be represented as an integer with 64 bits of
        precision (such as JavaScript) should skip this step."
    */
    getUserTimeline : (twittername: string, maxId?: TwitterTweetId) => Promise<TwitterAPITweet[]>

    /*
        https://dev.twitter.com/docs/api/1.1/get/search/tweets
        https://dev.twitter.com/docs/using-search
        endpoint: https://api.twitter.com/1.1/search/tweets.json
    */
    search: (parameters : TwitterAPISearchParams) => Promise<TwitterAPITweet[]>


    /*
        https://dev.twitter.com/rest/reference/get/users/lookup
        endpoint: https://api.twitter.com/1.1/users/lookup.json
    */
    lookupUsers: (user_ids: string[], screen_names?: string[]) => Promise<TwitterAPIUser[]>
}



interface TwitterAPIUserTimelineOptions{
    count?: number // between 0 and 200
    include_rts?: number // 0 or 1
    'trim_user'?: string // 't' or nothing
    screen_name?: string
    max_id?: TwitterTweetId
}


interface TwitterAPIUserLookupOptions{
    user_id?: string // 783214,6253282
    screen_name?: string // twitterapi,twitter
    include_entities : boolean
}

interface TwitterAPISearchParams{
    q: {
        text: string // the string shouldn't be encoded
        from: string
        to: string
        '@': string
        since: Date
        until: Date
        filter: string
    }
    since_id: TwitterTweetId
    max_id: TwitterTweetId
    count: number
    result_type: string // 'mixed', 'recent', 'popular'
    lang: string
    geocode: string
}



interface TwitterAPIEntities{
    urls: TwitterAPIURLEntity[]
    user_mentions: TwitterAPIUserMentionEntity[]
    media: TwitterAPIMediaEntity[]
}

interface TwitterAPIUserMentionEntity{
    id_str: TwitterUserId
    indices: number[]
}

interface TwitterAPIURLEntity{
    url: string
    expanded_url: string
    indices: number[]
}

interface TwitterAPIMediaEntity{

}



interface TwitterTweetId extends String{
    __TwitterTweetId : TwitterTweetId
}



interface TwitterAPITweet{
    // id: number // purposefully commented so TypeScript warns about its use, because it shouldn't be used in JS
    id_str : TwitterTweetId

    created_at : string // Date-parseable string

    entities: TwitterAPIEntities
    user: TwitterAPIUser
    text: string

    retweeted_status?: TwitterAPITweet
    retweet_count: number
    favorite_count: number

    in_reply_to_user_id_str: TwitterUserId
}

interface TwitterUserId{
    __TwitterUserId: TwitterUserId
}

interface TwitterAPIUser{
    id_str: TwitterUserId
    
    screen_name: string
    name: string
    profile_image_url_https : string
}

