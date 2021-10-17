const { defaultValueMap, overrideDefaultValueMap } = require("./defaultValueMap");
const { Internal, Both, IfNotExist, noObj, noFunc } = require("./Internal");
const { VALUE, FUNCTION, __call, TRAP, __resolve, IF_NOT_EXIST, RESOLVE, BOTH } = require('./Symbols');
const { Future } = require('./Future');
/**
 * @description This function outputs the Proxy.
 *              The actual methods are called when the target is set to proper value by 
 *              calling target.resolve(value);
 * @param {Future} target : o : Must be an instance of Future. 
 * @param {*} [interceptors] : An interceptor object (Optional)
 * @returns {Proxy}
 * 
 * 
    An interceptor can be either of the following:
        1. function(trapKey, arguments)
            Here, trapKey is any of the proxy handler key i.e. get, set, etc.
            arguments is the arguments to the handler trap.
        2. {
            ... same key value pairs as Proxy Handler . See https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy
        }
    
    Interceptor return values:
        1. If no value returned, same call will be made when the target is resolved.
        2. If any value other than the below, are returned, same call will be made when the target is resolved.
            2.a. <... Documentation in progress ... >
 */
function trap(target, interceptors) {
    interceptors = __getInterceptors(interceptors);
    const _calls = [];
    const defaultFunction = function(key) {
        return function(...args) {
            _calls.push([__call, args, key]);
        }
    };

    const p = new Proxy(target, new Proxy(noObj, {
        get: function(no, trapKey){
            return function(...args) {
                let targetO;
                let v1 = interceptors( trapKey , args );
                if(v1 && !(v1 instanceof Internal)) {
                    return v1; // Send the value and no real call!
                } else if(targetO = target.o) {
                    args[0] = targetO; //Real call
                    let v2 = Reflect[trapKey](...args);
                    if(v1 instanceof Both) { // Send intercepted value, chop off real value!
                        if(v1.callback) {
                            setTimeout(v1.callback, 0, v2);
                        }
                        return v1[VALUE];
                    }
                    if(trapKey === 'get' && typeof v2 === 'function') {
                        v2 = v2.bind(targetO)
                    }
                    return v2;
                }
                const key = args[1];
                if(!v1?.skip) {
                    _calls.push([trapKey, args]);
                }
                if(v1) { // v1 instanceof Internal
                    const v1Value = v1[VALUE];
                    if(v1.resolve) {
                        _calls.push([__resolve, [v1.resolve]]);
                        return v1Value;
                    }
                    if(typeof v1Value === 'function') {
                        return function(...args) {
                            const v = v1Value(...args);
                            _calls.push([__call, args, key]);
                            return v;
                        };
                    } else {
                        return v1[VALUE];
                    }
                }
                v1 = defaultValueMap[trapKey];
                if(v1 === FUNCTION) {
                    v1 = defaultFunction(key);
                }
                return v1;
            }
        }
    }));

    target.resolve = function(value) {
        if(target.o) {
            throw new Error("Cannot set twice!");
        }
        target.o = value;
        fulfill(target.o);
        return target;
    }

    target.addCall = function(callArgs = [], key = undefined) {
        _calls.push([__call, callArgs, key]);
        return target;
    }

    function fulfill(targetO) {
        let v;
        let values = {};
        if(target.emit) {
            target.emit('pre-resolved', targetO);
        }
        _calls.forEach(([trapKey, args, key]) => {
            if(trapKey === __resolve) {
                v = args.shift();
                trapKey = __call;
            }
            if(trapKey === __call) {
                if(key) {
                    v = values[key];
                }
                let value = v.apply(targetO, args);
                values[`${v.name}()`] = value;
                return;
            }
            args[0] = targetO;
            v = Reflect[trapKey](...args);
            if(trapKey === 'get') {
                values[args[1]] = v;
            } else if (trapKey === 'apply') {
                values['.'] = v;
            }
        });

        if(target.emit) {
            target.emit('resolved', values, targetO);
        }
    }

    return p;
}

function __getInterceptors(interceptors) {
    if(!interceptors) {
        return noFunc;
    }
    if(typeof interceptors === 'function') {
        return interceptors;
    }
    return function( trapKey, args ) {
        if(!(trapKey in interceptors)) {
            return;
        }
        const interceptor = interceptors[trapKey];
        if(typeof interceptor === 'function' ) {
            return interceptor(...args);
        }
        const key = args[1];
        let value = interceptor[key];
        if(value) {
            let valueTrap;
            if(valueTrap = value[TRAP]) {
                args = args.slice(2);
                value = valueTrap();
            } else if(valueTrap = value[IF_NOT_EXIST]) {
                const resolve = value[RESOLVE];
                value = new IfNotExist(valueTrap, resolve, resolve);
            } else if(valueTrap = value[BOTH]) {
                const resolve = value[RESOLVE];
                value = new Both(valueTrap, resolve, resolve);
            }
        }
        return value;
    }
}

function get(interceptor) {
    return { get: interceptor };
}


module.exports = exports = {
    trap, 
    Proxy: trap,

    IfNotExist, 
    Both, 
    Future,

    get, 
    TRAP, 
    IF_NOT_EXIST, 
    RESOLVE, 
    BOTH,

    Function,

    overrideDefaultValueMap
};