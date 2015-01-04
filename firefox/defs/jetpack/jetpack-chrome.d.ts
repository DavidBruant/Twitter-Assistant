declare module "chrome" {
    export var Cu : ComponentsUtils;
}

interface ComponentsUtils{
    import(path: string, to?: Object) : any
    import(path: "resource:///modules/devtools/shared/event-emitter.js", to?: Object) : EventEmitterExportObject
}



declare class EventEmitter{
    on(eventName: string, listener:(e:any)=>void) : void
    once(eventName: string, listener:(e:any)=>void) : void
    off(eventName: string, listener:(e:any)=>void) : void
    emit(eventName: string, event:any) : void
}

interface EventEmitterConstructor{
    decorate(o:any): void
}

interface EventEmitterExportObject{
    EventEmitter: EventEmitterConstructor
}


