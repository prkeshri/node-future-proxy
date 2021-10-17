<h1 align="center">Welcome to future-proxy 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> A proxy which wraps a potential &#34;future&#34; object, that does not exist Yet!

### 🏠 [Homepage](https://github.com/prkeshri/node-future-proxy)

## Install

```sh
npm install future-proxy
```

> A JS Proxy wraps an object where we can intercept (and do whatever we wish with the object!). But what if the object does not exist yet? One example being a mock http request (I am working on this ;)). So, here it goes. Here are a few examples that will illustrate the usage:
    

<u>Warning:</u> Only limitation is: By default, 'get' trap outputs a function. If you wish anything else, you will have to provide in interceptors!
<br/>

<b>Minimal Setup:</b>

        const proxy = require('./proxy');

        const t = new proxy.Future(); // Create a reference to some future object.
        const x = proxy.trap(t);

        // Do whatever you would do through x, as if the object 't' actually exists
        x.something(); // Where something is a method on future 't' object.

        // Later after sometime...
        t.resolve(futureObject); // Now, all the calls (get, set, etc.) to 'futureObject' will be made.

If you wish to trap a function, instead of new proxy.Future, call:
    
        new proxy.Future(proxy.Function);

The documentation is a progress to include the other (advanced) features. Meanwhile, files inside test/ can be referenced.


## API

### trap

This function outputs the Proxy.
The actual methods are called when the target is set to proper value by
calling target.resolve(value);

##### Parameters

*   `target` **Future** : o : Must be an instance of Future.
*   `interceptors` **any?** : An interceptor object (Optional) See [below](#interceptors).

##### Returns

`Proxy` : This records all the calls and calls them later when the target is resolved!

[interceptors]:  #interceptors
#### An interceptor can be either of the following:
1. ` function(trapKey, arguments)` Here, trapKey is any of the proxy handler key i.e. get, set, etc.
arguments is the arguments to the handler trap.
2. `{
    ... same key value pairs as Proxy Handler.
    See [https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy]
}`

#####  Interceptor return values and actions:
1.  If no value returned, same call will be made when the target is resolved.
2.  If any value other than the below, are returned, same call will be made when the target is resolved.2.a. 

<... More and advanced usage documentation in progress ... >


## Run tests

```sh
npm run test
```

## Author

👤 **Praveen Ranjan Keshri**

* Github: [@prkeshri](https://github.com/prkeshri)
* LinkedIn: [@prkeshri](https://linkedin.com/in/prkeshri)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_