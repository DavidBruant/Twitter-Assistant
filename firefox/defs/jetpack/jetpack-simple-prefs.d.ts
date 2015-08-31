declare module "sdk/simple-prefs" {
    export var prefs : Prefs
}

interface Prefs{
    "sdk.console.logLevel" : string
    "dev-env": boolean
}