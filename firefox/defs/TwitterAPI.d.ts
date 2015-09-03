
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
        https://dev.twitter.com/rest/reference/get/search/tweets
        https://dev.twitter.com/docs/using-search
        endpoint: https://api.twitter.com/1.1/search/tweets.json
    */
    search: (parameters : TwitterAPISearchParams) => Promise<TwitterAPITweet[]>


    /*
        https://dev.twitter.com/rest/reference/get/users/lookup
        endpoint: https://api.twitter.com/1.1/users/lookup.json
    */
    lookupUsersByIds: (user_ids: TwitterUserId[]) => Promise<TwitterAPIUser[]>
    lookupUsersByScreenNames: (screen_names: string[]) => Promise<TwitterAPIUser[]>
    
    /*
        https://dev.twitter.com/rest/reference/get/friends/ids
        endpoint : https://api.twitter.com/1.1/friends/ids.json
    */
    getFriends: (id: TwitterUserId) => Promise<{ids: TwitterUserId[]}>
    
    /*
        https://dev.twitter.com/rest/reference/get/help/languages
        endpoint : https://api.twitter.com/1.1/help/languages.jsonavril
    */
    getLanguages: () => Promise<{code: string, name: string}[]>
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
    hashtags: TwitterAPIHashtagEntity[]
}

interface TwitterAPIUserMentionEntity{
    id_str: TwitterUserId
    indices: number[]
    screen_name: string
}

interface TwitterAPIURLEntity{
    url: string
    expanded_url: string
    indices: number[]
}

interface TwitterAPIMediaEntity{
    url: string
}

interface TwitterAPIHashtagEntity{
    text: string
}



interface TwitterTweetId extends String{
    __TwitterTweetId : TwitterTweetId
}



interface TwitterAPITweet{
    // id: number // purposefully commented so TypeScript warns about its use, because it shouldn't be used in JS
    id_str : TwitterTweetId

    created_at : string // Date-parseable string

    entities: TwitterAPIEntities
    user: TwitterAPIReducedUser // the 'trim_user' parameter will always be used
    text: string
    lang: string

    retweeted_status?: TwitterAPITweet
    retweet_count: number
    favorite_count: number

    in_reply_to_user_id_str: TwitterUserId
}


interface TwitterUserId extends String{
    __TwitterUserId: TwitterUserId
}

/*
    Some API calls allow for a 'trim_user' parameter. When used, a reduced version of the user is used
*/
interface TwitterAPIReducedUser{
    // 'id' purposefully omitted
    id_str: TwitterUserId
}

interface TwitterAPIUser extends TwitterAPIReducedUser{
    screen_name: string
    name: string
    profile_image_url_https : string
}

