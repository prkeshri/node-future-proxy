const { EventEmitter } = require('events');
const { Func, noFunc } = require("./Internal");
const isPromise = require('is-promise');

/**
 * @description Holds a potential future object which is unavailable yet! 
 * 
 * @param {proxy.Function} [future] Optional: Can be proxy.Function if the 'future' object is expected to be a function
 * @param {Promise} [promise]  Optional: If present, the future will be auto resolved once the promise is resolved
 * @returns Future Object
 */
    
class Future extends EventEmitter {
    constructor(future = undefined, promise = undefined) {
        if (typeof future === 'function') {
            future = new Func;
            Object.assign(future, EventEmitter.prototype);
            if(promise && isPromise(promise)) {
                promise.then(_ => future.resolve(_));
            }
            future.await = Future.prototype.await;
        } else {
            if(future && isPromise(future)) {
                const promise = future;
                promise.then(_ => future.resolve(_));
            }
            super();
            future = this;
        }
        future.o = null;
        future.resolve = future.addCall = noFunc; // Will be defined in trap method
        return future;
    }

    /**
     * @description Awaits for the promise and resolves once the promise resolves.
     * @param {Promise} promise 
     * @returns this
     */
    await(promise) {
        (async _ => {
            this.resolve(await promise);
        })();
        return this;
    }
}

exports.Future = Future;
