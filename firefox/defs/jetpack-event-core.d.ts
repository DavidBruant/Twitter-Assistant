declare module "sdk/event/target"{
    export class JetpackEventTarget implements JetpackEventTargetI{
        on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void
    }
    
    export interface JetpackEventTargetI{
        on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void
    }
}

