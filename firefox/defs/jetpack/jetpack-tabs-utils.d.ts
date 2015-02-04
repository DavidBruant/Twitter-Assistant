declare module "sdk/tabs/utils" {
    export function getTabs() : XulTab[]
    export function getTabId(tab : XulTab) : number
    export function getTabContentWindow(tab: XulTab) : ContentWindow
}

interface Global{}

interface XulTab{

}

interface ContentWindow extends Global{

}