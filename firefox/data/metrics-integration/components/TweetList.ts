"use strict";

import getRetweetOriginalTweet = require('../getRetweetOriginalTweet');

interface TweetListProps{
    title: number
    tweets: TwitterAPITweet[]
    users: Map<TwitterUserId, TwitterAPIUser>,
    askUsers: (userIds: TwitterUserId[]) => void;
}


const TweetList = React.createClass({

    render: function(){
        const props : TweetListProps = this.props;

        const missingUsers :TwitterUserId[] = [];
        
        // this is ugly
        setTimeout(() => {
            if(missingUsers.length >= 1)
                props.askUsers(missingUsers);
        }, 20)
        
        return React.DOM.div({className: 'AppContainer'}, 
            React.DOM.div({className: 'AppContent-main content-main u-cf'},
                React.DOM.div({className: 'Grid Grid--withGutter'},
                    React.DOM.div({className: 'Grid-cell u-size1of3 u-lg-size1of4'}),
                    React.DOM.div({className: 'Grid-cell u-size2of3 u-lg-size3of4'},
                        React.DOM.div({className: 'Grid Grid--withGutter'},
                            React.DOM.div({className: 'TA-tl-container Grid-cell u-lg-size2of3'},
                                // finally some content...
                                React.DOM.div({className: 'ProfileHeading'},
                                    // no... wait...
                                    React.DOM.div({className: 'ProfileHeading-content'},
                                        React.DOM.div({className: 'ProfileHeading-toggle'},
                                            // there you go!
                                            React.DOM.h2({className: 'ProfileHeading-toggleItem is-active'},
                                                props.title
                                            )
                                            /*React.DOM.button(
                                                {
                                                    className: 'btn-link back-to-top',
                                                    onClick: e => {
                                                        throw 'TODO';
                                                    }
                                                },
                                                'Close'
                                            )*/
                                        )
                                    )
                                ),
                                React.DOM.div({ className: 'timeline' },
                                    React.DOM.ol({className: 'stream-items'}, props.tweets.map(t => {
                                        const originalTweet = getRetweetOriginalTweet(t)
                                        
                                        const userId = originalTweet.user.id_str;
                                        const user = props.users.get(originalTweet.user.id_str) || {
                                            profile_image_url_https: '',
                                            screen_name: '',
                                            name: ''
                                        };
                                        
                                        if(!props.users.has(originalTweet.user.id_str))
                                            missingUsers.push(originalTweet.user.id_str)
                                        
                                        
                                        console.log('tweet user', userId, user);
                                        
                                        return React.DOM.li({className: 'TA-tweet-item stream-item expanding-stream-item'}, 
                                            React.DOM.div({className: 'TA-tweet-item-inner tweet'},
                                                React.DOM.div({className: 'content'},
                                                    React.DOM.div({className: 'stream-item-header'},
                                                        React.DOM.a(
                                                            {
                                                                className: 'account-group js-account-group js-action-profile js-user-profile-link js-nav',
                                                                href: user.screen_name ? '/'+user.screen_name : undefined,
                                                                target: '_blank'
                                                            },
                                                            React.DOM.img({className: 'avatar', src: user.profile_image_url_https }),
                                                            React.DOM.strong({className: 'fullname js-action-profile-name show-popup-with-id'}, user.name),
                                                            React.DOM.span({}, ''), // useless span because why not
                                                            React.DOM.span({className: 'username js-action-profile-name'},
                                                                React.DOM.s({}, '@'), 
                                                                React.DOM.b({}, user.screen_name)
                                                            )
                                                        ),
                                                        React.DOM.small({className: 'time'},
                                                            React.DOM.a(
                                                                {
                                                                    className: 'tweet-timestamp',
                                                                    title: originalTweet.created_at,
                                                                    href: '/statuses/'+t.id_str,
                                                                    target: '_blank'
                                                                },
                                                                React.DOM.span({className: '_timestamp'}, originalTweet.created_at)
                                                            )
                                                        )
                                                    ),
                                                    React.DOM.p({className: 'TweetTextSize TweetTextSize--16px tweet-text'}, originalTweet.text)
                                                )
                                            )
                                        )
                                    }))
                                )
                            ),
                            React.DOM.div({className: 'Grid-cell u-size1of3'})
                        )
                    )
                )
            )
        );
    }
});

export = TweetList;