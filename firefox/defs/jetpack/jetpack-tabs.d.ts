declare module "sdk/tabs" {
    
    import WorkerModule = require("sdk/content/worker");
    
    // part of event emitter. Figure out a way to share that across different modules
    export function on(eventName: string, listener: (e: any) => void) : void 
    
    export function once(eventName: 'open', listener: (tab: SdkTab) => void) : void 
    export function once(eventName: string, listener: (e: any) => void) : void 
    
    export var activeTab : SdkTab
    export function open(url: string) : void
    
    export interface SdkTab extends JetpackEventTarget{
        id: number
        attach: (desc: WorkerModule.WorkerDescription) => WorkerModule.Worker
        title: string
        url: string
    
        close: () => void
    
        // TODO document specific events
        /*on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void*/
    }
}



