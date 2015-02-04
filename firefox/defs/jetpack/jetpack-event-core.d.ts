declare module "sdk/event/target"{
    export class JetpackEventTarget implements JetpackEventTarget{
        on(eventName: string, listener:(e:any)=>void) : void
        once(eventName: string, listener:(e:any)=>void) : void
        off(eventName: string, listener:(e:any)=>void) : void
        emit(eventName: string, event:any) : void
    }
    
}

interface JetpackEventTarget{
    on(eventName: string, listener:(e:any)=>void) : void
    once(eventName: string, listener:(e:any)=>void) : void
    off(eventName: string, listener:(e:any)=>void) : void
    emit(eventName: string, event:any) : void
}