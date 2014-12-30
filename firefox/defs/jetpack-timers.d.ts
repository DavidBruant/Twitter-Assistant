declare module "sdk/timers" {
    export function setTimeout(fn: () => void, time:number ) : TimeoutId;
    export function setInterval(fn: () => void, time:number ) : IntervalId;
    export function clearTimeout(id: TimeoutId ) : void
    export function clearInterval(id: IntervalId ) : void
}

interface TimeoutId{}
interface IntervalId{}