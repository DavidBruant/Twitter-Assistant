import windowsModule = require('sdk/windows');

const windows = windowsModule.browserWindows;

/*
    twitterPermissionURL is made of an oauth request token
*/
function askUserTwitterPermissions(urls){
    const twitterPermissionURL = urls.twitterPermissionURL;
    const twitterCallbackURL = urls.twitterCallbackURL;

    const twitterSigninWindow = windows.open(twitterPermissionURL);
            
    return new Promise(resolve => {
        twitterSigninWindow.on('open', w => {
            const tab = w.tabs.activeTab;
            tab.on('ready', t => {
                if(t.url.startsWith(twitterCallbackURL)){
                    const parsedURL = URL(t.url);
                    const search = parsedURL.search;
                    const query = new Map<string, string>();

                    search.slice(1).split('&')
                        .forEach(p => {
                            const x = p.split('=');
                            query.set(x[0], x[1]);
                        });
                    w.close();
                    // this token is an oauth access token
                    resolve(query.get('oauth_token'));
                }

            });
        })
    })
};

export = askUserTwitterPermissions;