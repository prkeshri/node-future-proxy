const { VALUE } = require('./Symbols');

class Internal {
    constructor(value) {
        this[VALUE] = value;
    }
}

class IfNotExist extends Internal {
    constructor(value, skip = false, valueWhenExists = undefined) {
        super(value);
        this.skip = Boolean(skip);
        if (skip && valueWhenExists) {
            this.resolve = valueWhenExists;
        }
    }
}

class Both extends Internal {
    constructor(value, callback) {
        super(value);
        this.callback = callback;
    }
}

class Func extends Function {
}

const noFunc = function () { };

const noObj = {};

exports.Internal = Internal;
exports.IfNotExist = IfNotExist;
exports.Both = Both;
exports.Func = Func;
exports.noFunc = noFunc;
exports.noObj = noObj;