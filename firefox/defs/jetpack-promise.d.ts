declare module "sdk/core/promise"{
    export function defer<T>(): Deferred<T>;
}


interface Deferred<T> {
    promise: JetpackPromise<T>;
    resolve(value: T): void;
    reject(reason: any): void;
}

interface JetpackPromise<T> {
    then<U>(onFulfill: (value: T) => U, onReject?: (reason:any) => U): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => JetpackPromise<U>, onReject?: (reason:any) => U): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => U, onReject?: (reason:any) => JetpackPromise<U>): JetpackPromise<U>;
    then<U>(onFulfill: (value: T) => JetpackPromise<U>, onReject?: (reason:any) => JetpackPromise<U>): JetpackPromise<U>;
}