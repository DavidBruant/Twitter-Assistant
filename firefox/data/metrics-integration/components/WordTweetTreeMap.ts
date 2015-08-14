'use strict';

interface WordTweetTreeMapProps{
    wordToTweetsMap: Map<string, TwitterAPITweet[]>
}

const WordTweetTreeMap = React.createClass({

    render: function(){ 
        const props : WordTweetTreeMapProps = this.props;
        const wordToTweetsMap = props.wordToTweetsMap;
        
        
        console.log('wordToTweetsMap', wordToTweetsMap);

        return React.DOM.section({className: 'word-tweet-tree-map'}, 
            
        );
    }
});

export = WordTweetTreeMap;