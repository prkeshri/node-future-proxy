const proxy = require('./proxy');

const t = new proxy.Future(proxy.Function);
const x = proxy.trap(t);
_console().log(x.abcd());
_console().log(x.efgh());
x.h = 23;
t.on('resolved', values => {
    _console().log(values);
    if(typeof _ !== 'undefined') {
        _();
    }
});

x();
setTimeout(_ => {
    const f = function() {
        _console().log("WWW");
        return "WOW";
    }
    Object.assign(f, {
        abcd: function() {
            _console().log("ABCD");
            return 23;
        },
        efgh: function() {
            _console().log("EFGH");
        },
        h: 4
    });

    t.resolve(f);
},3000);