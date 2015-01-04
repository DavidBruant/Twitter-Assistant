
// https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/content_worker

declare module "sdk/content/worker" {
    
    //import EventTargetModule = require("sdk/event/target");
    //import JetpackPortModule = require("JetpackPort");
     
    export class Worker implements JetpackEventTarget {
        constructor(options : WorkerOptions)
        port : JetpackPort
        
        on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void
    }
    
    export interface WorkerOptions extends WorkerDescription{
        window: Window
    }
    
    export interface WorkerDescription{
        contentScriptFile?: any // string | string[] in TypeScript 1.4
        contentScriptOptions?: Object
        onMessage?: (message: any) => void
        onError?: (message: Error) => void
    }
}


