'use strict';

interface WordTweetTreeMapProps{
    wordToTweetsMap: Map<string, TwitterAPITweet[]>
}

console.log('WordTweetTreeMap');

const WordTweetTreeMap = React.createClass({

    render: function(){ 
        const props : WordTweetTreeMapProps = this.props;
        const wordToTweetsMap = props.wordToTweetsMap;
        
        console.log('wordToTweetsMap', wordToTweetsMap);

        const lis : any = [];
        
        wordToTweetsMap.forEach( (tweets, word) => 
            lis.push(React.DOM.li({key: word},
                React.DOM.span({}, word),
                React.DOM.span({}, tweets.length)
            ))
        );
        
        
        
        return React.DOM.section(
            {className: 'word-tweet-tree-map'}, 
            React.DOM.ol({}, lis)
        );
    }
});

export = WordTweetTreeMap;