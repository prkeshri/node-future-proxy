const { Future, Function, trap, TRAP, IfNotExist } = require('./proxy');

const t = new Future(Function);
Function.prototype.toJSON = Function.prototype.toString;
const x = trap(t, {
    get: {
        [TRAP]: {
            abcd : function (...args) {
                args = args.slice();
                _console().log(JSON.stringify({args}));
                return new IfNotExist(function(...args) {
                    return  {args};
                }, true, function() {
                    _console().log("!!!--- ARGS !!!---", args)
                });
            }
        }
    }
});
_console().log(x.abcd(4,5));
_console().log(x.efgh(6,7));
x.h = 77;
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
    })
    t.resolve(f);
},3000);