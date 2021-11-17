let proxy;
/**
 * @param {string} module Module to import and wait for resolution
 * @returns {string} Proxy created using proxy.trap
 */
function Import(module) {
    proxy = proxy || require('./proxy'); // to avoid circular dependency

    const f = new proxy.Future(proxy.Function, import(module).then(_ => _.default))
    const p = proxy.trap(f);
    return p;
}

module.exports = {
    Import
}