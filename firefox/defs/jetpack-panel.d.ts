
declare module "sdk/panel" {
    import ui = require("sdk/ui");
    import EventTargetModule = require("sdk/event/target");
    import JetpackPortModule = require("JetpackPort");
    
    export class Panel extends EventTargetModule.JetpackEventTarget{
        constructor(params: PanelParams)
        show: (params: ShowParams) => void
        hide: () => void
        port: JetpackPortModule.JetpackPort
    }
    
    export interface PanelParams{
        width: number   
        height: number 
        contentURL: string
    }

    export interface ShowParams{
        position: ui.ActionButton
    }
}

