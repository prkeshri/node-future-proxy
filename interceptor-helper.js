const { Internal, Both, IfNotExist, noFunc } = require("./Internal");
const {
    TRAP,
    IF_NOT_EXIST,
    RESOLVE,
    BOTH,
    VALUE,
    __call,
    ID,
} = require("./Symbols");

function __getInterceptors(interceptors) {
    if (!interceptors) {
        return noFunc;
    }
    if (typeof interceptors === "function") {
        return interceptors;
    }
    return function (trapKey, args) {
        if (!(trapKey in interceptors)) {
            return;
        }
        const interceptor = interceptors[trapKey];
        if (typeof interceptor === "function") {
            return interceptor(...args);
        }
        const key = args[1];
        let value = interceptor[key];
        if (value) {
            let valueTrap = interceptor?.[TRAP]?.[key];
            if ((valueTrap = value[TRAP])) {
                value = valueTrap(...args);
            } else if ((valueTrap = value[IF_NOT_EXIST])) {
                const resolve = value[RESOLVE];
                value = new IfNotExist(valueTrap, resolve, resolve);
            } else if ((valueTrap = value[BOTH])) {
                const resolve = value[RESOLVE];
                value = new Both(valueTrap, resolve, resolve);
            }
        }
        return value;
    };
}

function __getPostInterceptor(currentProxy, target, addCallInfo) {
    return function (trapKey, args, iv) {
        let targetO;
        if (iv && !(iv instanceof Internal)) {
            return iv; // Send the value and no real call!
        } else if ((targetO = target.o)) {
            args[0] = targetO; //Real call
            let v2 = Reflect[trapKey](...args);
            if (iv instanceof Both) {
                // Send intercepted value, chop off real value!
                if (iv.callback) {
                    setTimeout(iv.callback, 0, v2);
                }
                return iv[VALUE];
            }
            if (trapKey === "get" && typeof v2 === "function") {
                v2 = v2.bind(targetO);
            }
            return v2;
        }
        const key = args[1];
        let wrap = function (w) {
            if (!iv?.skip) {
                return new Internal(w);
            }
            return w;
        };

        if (iv) {
            // v1 instanceof Internal
            const v1Value = iv[VALUE];
            let ivResolve = iv.resolve;
            if (ivResolve) {
                // **not required** let returnProxy = proxychain(noFunc, noFunc, currentProxy);
                // returnProxy[ID].value(iv.resolve);
                addCallInfo({
                    [__call]: function (returnProxy, values = {}) {
                        console.log({args})
                        let value = ivResolve.call(target.o);
                        if (returnProxy) returnProxy[ID].value(value);
                        values[`${ivResolve.name}()`] = value;
                    },
                });
                return wrap(v1Value);
            }
            if (typeof v1Value === "function") {
                return wrap(function (...args) {
                    let v = v1Value(...args);
                    addCallInfo({
                        [__call]: function (returnProxy, values = {}) {
                            if (key) {
                                v = currentProxy[ID].value();
                            }
                            let value = v.apply(target.o, args);
                            if (returnProxy) returnProxy[ID].value(value);
                            values[`${v.name}()`] = value;
                        },
                    });
                    return v;
                });
            } else {
                return wrap(iv[VALUE]);
            }
        }
    };
}

function get(interceptor) {
    return { get: interceptor };
}

exports.__getInterceptors = __getInterceptors;
exports.__getPostInterceptor = __getPostInterceptor;
exports.get = get;
