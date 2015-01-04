declare module "sdk/system/events" {
    // boolean may be optional, but putting it compulsory to not forget to set it to "true" (strong ref which is what we usually want)
    export function on(e: string, listener: (event: SystemEvent) => void , strong: boolean) : void
    export function on(e: "content-document-global-created", listener: (event: ContentDocumentGlobalCreatedSystemEvent) => void , strong: boolean) : void
}

interface SystemEvent{
    type : string
    subject : any
    data : any
}

interface ContentDocumentGlobalCreatedSystemEvent extends SystemEvent{
    //type === "content-document-global-created"
    subject: ContentWindow
    data: string // origin
}


