const fs = require('fs');
let mode = process.argv[2] || "all";
let testFiles = fs.readdirSync(__dirname).filter(f => f !== 'proxy.test.js' && f.indexOf('proxy.test') > -1);
testFiles = testFiles.sort((x, y) => {
    const ax = parseInt(x.split('proxy.test')[1]),
        ay = parseInt(y.split('proxy.test')[1]);
        return ax - ay;
});

// testFiles = testFiles.map(file => {
//     let txt = fs.readFileSync(__dirname + '/' + file).toString();
//     txt = `(_ => { ${txt}})`;

//     const code = eval(txt);
//     return code;
// });

let i = -1, len = testFiles.length, filterOut = [];
if(mode === 'last') {
    i = len - 2;
} else if(mode === 'first') {
    len = 1;
} else if(mode !== 'all') {
    mode = mode.split(",").map(i => parseInt(i));
    filterOut = testFiles.filter((_,i) => mode.indexOf(i+1) === -1);
}
global._ = nextI;
function nextI() {
    i++;
    if(i === testFiles.length) {
        fulfillall();
        return console.log(`================= DONE =================`);
    }
    const testFile = testFiles[i];
    if(filterOut.indexOf(testFile) > -1) {
        return nextI();
    }
    _console(`proxy.test${i+1}.js`).log(`================= RUNNING TEST :${i+1}/${len} =================`);
    require('./' + testFile);;
}

const proxy = require('./proxy');
const consoleMaps = {};
global._console = function(callerFile = _getCallerFile().split('/').pop()) {
    let callerProxy = consoleMaps[callerFile];
    if(!callerProxy) {
        const t = new proxy.Future;
        callerProxy = consoleMaps[callerFile] = {c: proxy.trap(t), t}
    }
    return callerProxy.c;
}

function fulfillall() {
    Object.keys(consoleMaps).forEach(file => {
        const c = consoleMaps[file];
        c.t.resolve(console);
    });
}
function _getCallerFile() {
    var originalFunc = Error.prepareStackTrace;

    var callerfile;
    try {
        var err = new Error();
        var currentfile;

        Error.prepareStackTrace = function (err, stack) { return stack; };

        currentfile = err.stack.shift().getFileName();

        while (err.stack.length) {
            callerfile = err.stack.shift().getFileName();

            if(currentfile !== callerfile) break;
        }
    } catch (e) {}

    Error.prepareStackTrace = originalFunc; 

    return callerfile;
}

nextI();

process.on("uncaughtException", (args) => {
    console.log(...args);
})

const gS = global.setTimeout;
global.setTimeout = function(...args) {
    args[1] = 0;
    gS(...args);
}