/*interface Set<T> {
    add(value: T): Set<T>;
    clear(): void;
    delete(value: T): boolean;
    entries(): Iterator<[T, T]>;
    forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
    has(value: T): boolean;
    keys(): Iterator<T>;
    //size: number;
    values(): Iterator<T>;
    // [Symbol.iterator]():Iterator<T>;
    // [Symbol.toStringTag]: string;
}

interface SetConstructor {
    new <T>(): Set<T>;
    new <T>(iterable: Iterable<T>): Set<T>;
    prototype: Set<any>;
}
declare var Set: {
    new <T>(iterable?: Iterable<T>): Set<T>;
}
*/

interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    //[Symbol.iterator](): Iterator<T>;
    next(): IteratorResult<T>;
}

interface Iterable<T> {
  //[Symbol.iterator](): Iterator<T>;
}



declare function Proxy(target: Object, handler: Object) : void

// TODO figure out how to add Object.is
/*interface ES6Object extends typeof Object{
    is(x, y): boolean
}
    
declare var Object: ES6Object*/


/* 
    Promise 
    https://github.com/borisyankov/DefinitelyTyped/blob/master/es6-promise/es6-promise.d.ts
*/
// Type definitions for es6-promise
// Project: https://github.com/jakearchibald/ES6-Promise
// Definitions by: François de Campredon <https://github.com/fdecampredon/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface Thenable<R> {
	then<U>(onFulfilled?: (value: R) => Thenable<U>,  onRejected?: (error: any) => Thenable<U>): Thenable<U>;
	then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Thenable<U>;
	then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => Thenable<U>): Thenable<U>;
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Thenable<U>;
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => void): Thenable<U>;
}

declare class Promise<R> implements Thenable<R> {
	/**
	 * If you call resolve in the body of the callback passed to the constructor, 
	 * your promise is fulfilled with result object passed to resolve.
	 * If you call reject your promise is rejected with the object passed to resolve. 
	 * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
	 * Any errors thrown in the constructor callback will be implicitly passed to reject().
	 */
	constructor(callback: (resolve : (result?: R) => void, reject: (error: any) => void) => void);
	/**
	 * If you call resolve in the body of the callback passed to the constructor, 
	 * your promise will be fulfilled/rejected with the outcome of thenable passed to resolve.
	 * If you call reject your promise is rejected with the object passed to resolve. 
	 * For consistency and debugging (eg stack traces), obj should be an instanceof Error. 
	 * Any errors thrown in the constructor callback will be implicitly passed to reject().
	 */
	constructor(callback: (resolve : (thenable?: Thenable<R>) => void, reject: (error: any) => void) => void);

	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 * 
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => Thenable<U>,  onRejected?: (error: any) => Thenable<U>): Promise<U>;
	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 * 
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => Thenable<U>, onRejected?: (error: any) => U): Promise<U>;
	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 *
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => Thenable<U>,  onRejected?: (error: any) => void): Promise<U>;
	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 * 
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => Thenable<U>): Promise<U>;
	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects. 
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called. 
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason. 
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve. 
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 * 
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => U): Promise<U>;
	/**
	 * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
	 * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
	 * Both callbacks have a single parameter , the fulfillment value or rejection reason.
	 * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
	 * If an error is thrown in the callback, the returned promise rejects with that error.
	 *
	 * @param onFulfilled called when/if "promise" resolves
	 * @param onRejected called when/if "promise" rejects
	 */
	then<U>(onFulfilled?: (value: R) => U, onRejected?: (error: any) => void): Promise<U>;

	/**
	 * Sugar for promise.then(undefined, onRejected)
	 * 
	 * @param onRejected called when/if "promise" rejects
	 */
	catch<U>(onRejected?: (error: any) => Thenable<U>): Promise<U>;
	/**
	 * Sugar for promise.then(undefined, onRejected)
	 * 
	 * @param onRejected called when/if "promise" rejects
	 */
	catch<U>(onRejected?: (error: any) => U): Promise<U>;
	/**
	 * Sugar for promise.then(undefined, onRejected)
	 *
	 * @param onRejected called when/if "promise" rejects
	 */
	catch<U>(onRejected?: (error: any) => void): Promise<U>;
}

declare module Promise {
	/**
	 * Make a new promise from the thenable. 
	 * A thenable is promise-like in as far as it has a "then" method. 
	 */
	function resolve<R>(thenable?: Thenable<R>): Promise<R>;
	/**
	 * Make a promise that fulfills to obj.
	 */
	function resolve<R>(object?: R): Promise<R>;
	
	/**
	 * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
	 */
	function reject(error: any): Promise<any>;
	
	/**
	 * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects. 
	 * the array passed to all can be a mixture of promise-like objects and other objects. 
	 * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
	 */
	function all<R>(promises: Promise<R>[]): Promise<R[]>;
	
	/**
	 * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
	 */
	function race<R>(promises: Promise<R>[]): Promise<R>;
}




interface Array<T> {
    /** Iterator */
    // [Symbol.iterator] (): Iterator<T>;
    /**
    * Returns an array of key, value pairs for every entry in the array
    */
    entries(): Iterator<[number, T]>;
    /**
    * Returns an list of keys in the array
    */
    keys(): Iterator<number>;
    /**
    * Returns an list of values in the array
    */
    values(): Iterator<T>;
    /**
    * Returns the value of the first element in the array where predicate is true, and undefined
    * otherwise.
    * @param predicate find calls predicate once for each element of the array, in ascending
    * order, until it finds one where predicate returns true. If such an element is found, find
    * immediately returns that element value. Otherwise, find returns undefined.
    * @param thisArg If provided, it will be used as the this value for each invocation of
    * predicate. If it is not provided, undefined is used instead.
    */
    find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T;
    /**
    * Returns the index of the first element in the array where predicate is true, and undefined
    * otherwise.
    * @param predicate find calls predicate once for each element of the array, in ascending
    * order, until it finds one where predicate returns true. If such an element is found, find
    * immediately returns that element value. Otherwise, find returns undefined.
    * @param thisArg If provided, it will be used as the this value for each invocation of
    * predicate. If it is not provided, undefined is used instead.
    */
    findIndex(predicate: (value: T) => boolean, thisArg?: any): number;
    /**
    * Returns the this object after filling the section identified by start and end with value
    * @param value value to fill array section with
    * @param start index to start filling the array at. If start is negative, it is treated as
    * length+start where length is the length of the array.
    * @param end index to stop filling the array at. If end is negative, it is treated as
    * length+end.
    */
    fill(value: T, start?: number, end?: number): T[];
    /**
    * Returns the this object after copying a section of the array identified by start and end
    * to the same array starting at position target
    * @param target If target is negative, it is treated as length+target where length is the
    * length of the array.
    * @param start If start is negative, it is treated as length+start. If end is negative, it
    * is treated as length+end.
    * @param end If not specified, length of the this object is used as its default value.
    */
    copyWithin(target: number, start: number, end?: number): T[];
}

interface String {
    /** Iterator */
    // [Symbol.iterator] (): Iterator<string>;

    /**
      * Returns a nonnegative integer Number less than 1114112 (0x110000) that is the code point 
      * value of the UTF-16 encoded code point starting at the string element at position pos in 
      * the String resulting from converting this object to a String. 
      * If there is no element at that position, the result is undefined. 
      * If a valid UTF-16 surrogate pair does not begin at pos, the result is the code unit at pos.
      */
    codePointAt(pos: number): number;

    /**
      * Returns true if searchString appears as a substring of the result of converting this 
      * object to a String, at one or more positions that are 
      * greater than or equal to position; otherwise, returns false.
      * @param searchString search string 
      * @param position If position is undefined, 0 is assumed, so as to search all of the String.
      */
    contains(searchString: string, position?: number): boolean;

    /**
      * Returns true if the sequence of elements of searchString converted to a String is the 
      * same as the corresponding elements of this object (converted to a String) starting at 
      * endPosition – length(this). Otherwise returns false.
      */
    endsWith(searchString: string, endPosition?: number): boolean;

    /**
      * Returns the String value result of normalizing the string into the normalization form 
      * named by form as specified in Unicode Standard Annex #15, Unicode Normalization Forms.
      * @param form Applicable values: "NFC", "NFD", "NFKC", or "NFKD", If not specified default
      * is "NFC"
      */
    normalize(form?: string): string;

    /**
      * Returns a String value that is made from count copies appended together. If count is 0, 
      * T is the empty String is returned.
      * @param count number of copies to append
      */
    repeat(count: number): string;

    /**
      * Returns true if the sequence of elements of searchString converted to a String is the 
      * same as the corresponding elements of this object (converted to a String) starting at 
      * position. Otherwise returns false.
      */
    startsWith(searchString: string, position?: number): boolean;

    /**
      * Returns an <a> HTML anchor element and sets the name attribute to the text value
      * @param name
      */
    anchor(name: string): string;

    /** Returns a <big> HTML element */
    big(): string;

    /** Returns a <blink> HTML element */
    blink(): string;

    /** Returns a <b> HTML element */
    bold(): string;

    /** Returns a <tt> HTML element */
    fixed(): string

    /** Returns a <font> HTML element and sets the color attribute value */
    fontcolor(color: string): string

    /** Returns a <font> HTML element and sets the size attribute value */
    fontsize(size: number): string;

    /** Returns a <font> HTML element and sets the size attribute value */
    fontsize(size: string): string;

    /** Returns an <i> HTML element */
    italics(): string;

    /** Returns an <a> HTML element and sets the href attribute value */
    link(url: string): string;

    /** Returns a <small> HTML element */
    small(): string;

    /** Returns a <strike> HTML element */
    strike(): string;

    /** Returns a <sub> HTML element */
    sub(): string;

    /** Returns a <sup> HTML element */
    sup(): string;
}
