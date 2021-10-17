const proxy = require('./proxy');

const t = new proxy.Future(proxy.Function);
Function.prototype.toJSON = Function.prototype.toString;
const x = proxy.trap(t, {
    get: function(...args) {
        args = args.slice();
        if(typeof args[args.length -1 ] === 'function') {
            args.pop();
        }
        _console().log(JSON.stringify({args}));
    }
});
_console().log(x.abcd());
_console().log(x.efgh());
x.h;
delete x.h;
t.on('resolved', values => {
    _console().log(values);
    if(typeof _ !== 'undefined') {
        _();
    }
});

x(2,3,4);
setTimeout(_ => {
    const f = function() {
        _console().log("WWW", arguments);
        return "WOW";
    }
    Object.assign(f, {
        abcd: function() {
            _console().log("ABCD");
            return 23;
        },
        efgh: function() {
            _console().log("EFGH");
        }
    });

    Object.defineProperty(f, 'h', {
        get: function() {
            _console().log("GET: f.h");
            return 4;
        }
    });

    t.resolve(f);
},3000);