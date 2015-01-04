
// https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/preferences_service
declare module "sdk/preferences/service" {
    export function get(prefName: string, defaultValue?: any) : any
    export function set(prefName: string, value: any) : void
}