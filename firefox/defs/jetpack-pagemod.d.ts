
declare module "sdk/page-mod" {
    import EventTargetModule = require("sdk/event/target");
    //import JetpackPortModule = require("JetpackPort");
    
    export class PageMod extends EventTargetModule.JetpackEventTarget{
        constructor(params: PageModParams)
        //port: JetpackPortModule.JetpackPort
    }
    
    export interface PageModParams{
    }
}

