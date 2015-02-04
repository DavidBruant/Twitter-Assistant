interface OAuthCredentials{
    key: string
    secret: string
}

// specialized string
interface AccessToken extends String{
    __AccessToken : AccessToken
}