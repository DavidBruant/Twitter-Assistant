
declare module "sdk/net/xhr" {
    export var XMLHttpRequest: {
        prototype: XMLHttpRequest;
        new(params?: JetpackXHRParams): XMLHttpRequest;
    }
    
    interface JetpackXHRParams{
        mozAnon: boolean
    }
}