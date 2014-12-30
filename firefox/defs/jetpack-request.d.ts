
declare module "sdk/request" {
    export function Request(desc: RequestDescription) : {
        get: () => void;
        post: () => void;
    }
    
    interface RequestDescription{
        url: string
        headers: Object // a finer-grain description of header could be good
        onComplete: (response: SDKRequestResponse) => void
        onError: (error: Error) => void
    }

    interface SDKRequestResponse{
        json: Object
        status: number
    }
}