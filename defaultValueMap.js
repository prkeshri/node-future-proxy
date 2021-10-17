const { FUNCTION } = require('./Symbols');

const defaultValueMap = {
    "apply": undefined,
    "construct": {},
    "defineProperty": true,
    "deleteProperty": true,
    "get": FUNCTION,
    "getOwnPropertyDescriptor": undefined,
    "getPrototypeOf": {},
    "has": false,
    "isExtensible": false,
    "ownKeys": {},
    "preventExtensions": false,
    "set": true,
    "setPrototypeOf": true,
};
const overrideDefaultValueMap = function (newValueMap) {
    return Object.assign(overrideDefaultValueMap, newValueMap);
};

exports.defaultValueMap = defaultValueMap;
exports.overrideDefaultValueMap = overrideDefaultValueMap;