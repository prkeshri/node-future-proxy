const {
    defaultValueMap,
    overrideDefaultValueMap,
} = require("./defaultValueMap");
const { Internal, noObj, noFunc, IfNotExist, Both } = require("./Internal");
const {
    VALUE,
    ID,
    FUNCTION,
    __call,
    IF_NOT_EXIST,
    BOTH,
    TRAP,
    RESOLVE,
} = require("./Symbols");
const { Future } = require("./Future");
const {
    __getInterceptors,
    get,
    __getPostInterceptor,
} = require("./interceptor-helper");
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
function trap(target = noObj, interceptors = noFunc) {
    interceptors = __getInterceptors(interceptors);
    const _calls = [];

    function proxychain(target, interceptors, parentProxy, meKey = "") {
        const __calls = [];
        let value, parent;
        const me_ID = {
            // #hi traps get, set
            resolve: function (returnValues) {
                let { trapKey, args, returnProxy, [__call]: _call } = __calls.shift();

                if (_call) {
                    return _call(returnProxy, returnValues);
                }

                args[0] = value;
                if (args[1] === VALUE) {
                    args[1] = parent;
                }
                let v = Reflect[trapKey].apply(Reflect, args);
                returnProxy[ID].value(v, value);

                returnValues[meKey + (trapKey === "apply" ? "." : "")] = v;
            },
            value: function (_value, _parent) {
                if (arguments.length) {
                    value = _value;
                    if (!parent) {
                        parent = _parent;
                    }
                }
                return value;
            },
            parent: () => parent,
        };

        const currentProxy = new Proxy(
            target,
            new Proxy(
                {},
                {
                    get: function (_no, trapKey) {
                        return function (...args) {
                            if (trapKey === "get" && args[1] === ID) {
                                return me_ID;
                            }

                            let iv = interceptors(trapKey, args);
                            iv = postInterceptor(trapKey, args, iv);
                            if (iv && !(iv instanceof Internal)) {
                                return iv;
                            }

                            const targetO = target.o;
                            if (targetO) {
                                args[0] = targetO;
                                return Reflect[trapKey].apply(Reflect, args);
                            }

                            let v1 = defaultValueMap[trapKey];
                            if (v1 !== FUNCTION) {
                                return v1;
                            }

                            let childKey =
                                (trapKey === "get" &&
                                    (meKey !== "" ? meKey + "." : "") + args[1]) ||
                                "";
                            let returnProxy = proxychain(
                                noFunc,
                                noFunc,
                                currentProxy,
                                childKey
                            );
                            if (trapKey === "get" || trapKey === "set") {
                                args.pop(); // #hi traps
                            } else if (
                                trapKey === "apply" &&
                                args[1] &&
                                args[1] === parentProxy
                            ) {
                                args[1] = VALUE;
                            }

                            let callInfo = { trapKey, args, returnProxy };
                            addCallInfo(callInfo);

                            if (iv) {
                                return iv[VALUE];
                            }
                            return returnProxy;
                        };
                    },
                }
            )
        );

        const postInterceptor = parentProxy
            ? noFunc
            : __getPostInterceptor(currentProxy, target, addCallInfo);

        return currentProxy;

        function addCallInfo(callInfo) {
            __calls.push(callInfo);
            _calls.push(me_ID);
        }
    }

    const p = proxychain(target, interceptors);

    target.resolve = function (value) {
        if (target.o) {
            throw new Error("Cannot set twice!");
        }
        target.o = value;
        fulfill(value);
        return target;
    };

    target.addCall = function (callArgs = [], key = undefined) {
        _calls.push({
            resolve: function (values) {
                if (key) {
                    v = values[key];
                }
                let value = v.apply(targetO, callArgs);
                values[`${v.name}()`] = value;
            },
        });
        return target;
    };

    function fulfill(targetO) {
        if (target.emit) {
            target.emit("pre-resolved", targetO);
        }

        p[ID].value(targetO);

        const values = {};
        if (_calls[0]) {
            _calls.forEach((_call) => _call.resolve(values));
        }

        if (target.emit) {
            target.emit("resolved", values, targetO);
        }
    }

    return p;
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

    overrideDefaultValueMap,
};
