const { EventEmitter } = require('events');
const { Func, noFunc } = require("./Internal");

class Future extends EventEmitter {
    constructor(f = undefined) {
        if (typeof f === 'function') {
            f = new Func;
            Object.assign(f, EventEmitter.prototype);
        } else {
            super();
            f = this;
        }
        f.o = null;
        f.resolve = f.addCall = noFunc; // Will be defined in trap method
        return f;
    }

    await(promise) {
        (async _ => {
            this.resolve(await promise);
        })();
        return this;
    }
}

exports.Future = Future;