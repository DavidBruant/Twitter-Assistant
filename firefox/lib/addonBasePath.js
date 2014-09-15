'use strict';

/*  
    Inspired by
    https://github.com/mozilla/addon-sdk/blob/f3b428aa4774f660aa4a6155894f6be8c53e46cc/lib/sdk/simple-storage.js#L249-L253
*/

const { Cc, Ci, Cu } = require("chrome");
const jpSelf = require("self");

const JETPACK_DIR_BASENAME = "jetpack";

module.exports = function(){
    const file = Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties).
        get("ProfD", Ci.nsIFile);
        file.append(JETPACK_DIR_BASENAME);
        file.append(jpSelf.id);
    return file.path;
}
