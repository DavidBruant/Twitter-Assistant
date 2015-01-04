declare module "sdk/self" {
    export var data: SelfData;
}

interface SelfData{
    url(id: string) : string
    load(id: string) : void
}