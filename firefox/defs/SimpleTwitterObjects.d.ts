
/* 
    Simple representation of a tweet 
*/
interface SimpleTweetId extends String{
    __SimpleTweetId: SimpleTweetId
}

interface SimpleTweet{
    id: SimpleTweetId
    text: string // actual text. Always. Not the crap returned by the Twitter API
    author: SimpleTwitterUserId
    retweet?: SimpleTweetId
    // mentions: maybe same things than 
    created_at: Date
}

/* 
    Simple representation of a Twitter User 
*/
interface SimpleTwitterUserId extends String{
    __SimpleTwitterUserId: SimpleTwitterUserId
}

interface SimpleTwitterUser{
    id: SimpleTwitterUserId
    follows: SimpleTwitterUserId[]
    followers: SimpleTwitterUserId[]
    created_at: Date
    profile_picture_url: string
}