
declare module "sdk/panel" {
    import ui = require("sdk/ui");
    import EventTargetModule = require("sdk/event/target");
    
    export class Panel implements JetpackEventTarget{
        constructor(params: PanelParams)
        show: (params: ShowParams) => void
        hide: () => void
        port: JetpackPort
        
        // TODO document specific events
        on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void
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

