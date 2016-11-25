# 2-sw

An experiment with 2 service workers, one controlling `/` and another controlling `/page-1/`.

Probably a longer version of this - https://twitter.com/jaffathecake/status/800960671890305026

Any static web server. For example,

```sh
python -m SimpleHTTPServer
```

+ [What?](#what)
+ [Experiment](#experiment)
+ [Results](#results)

## What?

`/` and `/page-1/` include both `/common.js` and `/common-2.js`

### `/`

The service-worker at `/` - [`/sw.js`](sw.js) does the following

```js
precache(CACHE_NAME, [
  "common.js",
  "common-2.js"
]);

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.pathname === "/common-2.js") {
    event.respondWith(cacheOnly(CACHE_NAME, event.request));
  }
});
```

### `/page-1`

The service-worker at `/page-1/` - [`/page-1/sw.js`](page-1/sw.js) does the following

```js
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  event.respondWith(
    removeFromCache(CACHE_NAME, new Request("/common-2.js"))
      .then(() => {
        if (url.pathname === "/common.js") {
          return cacheOnly(CACHE_NAME, event.request);
        }
        return fetch(event.request);
      })
  );
});
```

## Experiment

Fire up your devtools to watch the console messages and failed requests

### 0. Prepare

+ Make sure your existing service-worker doesn't disturb this (clear them!!!)
+ Make sure you **DO NOT** navigate to `/` before `/page-1/` (or clear them again!!!)
+ Use a browser with `async..await` support and service-worker support.

### 1. Navigate to `/page-1/`

+ First visit - no service worker
+ No errors. Everything loads from network.
+ Service Worker registration: `/page-1/sw.js` is registered for the scope `/page-1/` (note the `/` at the end - important)

### 2. Refresh the page - for the service worker to respond

+ console should display that it's not able to fetch `common.js`
+ You can refresh as many number of times as possible. **The same error should appear**

This is because we say in `/page-1/sw.js` that `/common.js` should be fetched ONLY FROM CACHE and there are no entries in cache till now.

### 3. Navigate to `/`

+ `/` loads
+ The page renders with no errors
+ service worker for `/` installs for the scope `/`
+ There will be no errors
+ Do the same dance of refreshing the page to verify there are no errors

This service worker has now precached two resources `/common.js` and `/common-2.js`. And it serves the request for `/common-2.js` via the strategy - cacheOnly.

### 4. Navigate back to `/page-1`

+ Now `common.js` is able to load and there is NO error

This is because we have navigated to `/` and that service-worker added the `common.js` to cache while precaching and page-1 is now able to fetch it from cache.

The service worker at page-1 does ONE OTHER thing - it DELETES the `/common-2.js` from the cache. (Remember the previous point that we serve `/common-2.js` using **cacheOnly** strategy)

### 5. You already know what to do. (Back to home - `/`)

As you would expect, there is no `/common-2.js` in the cache and the service worker will throw an error for the same.

--------

## Results

> What do we learn from this experiment ?

### Longest match / More specific match wins

When there are 2 service-workers for 2 URLs which have a Common Ancestor, then the longest match wins. A particular page can be controlled by ONLY ONE service worker.

Here we have `/` and `/page-1/`(this slash at the end is important to determine the service worker scope - where `/page-1` will fall under the scope `/`).

+ `/page-1` was controlled by the service-worker `/page-1/sw.js`
+ `/sw.js` was controlled by `/sw.js`

### The CacheStorage is shared between all the service-workers of the same domain

From the experiment, we were able to see that `/page-1`'s service-worker was able to -

1. Handle the requests to `/common.js` which is outside the scope of `/page-1/`.
2. access from the cache `/common.js` which was cached by the other service-worker (at `/`)
3. delete from the cache `/common-2.js` which was cached by the service-worker at `/` and change the behavior/assumption of `/`.
  + assumption of `/` - precached `common-2.js` - now it SHOULD be in the cache

**Solution(maybe if this is a problem for you)**: Use better cache names. Don't modify things you don't own. If one part of your web application REALLY wants to screw up the other part of the SAME web application, then there are better ways to screw up than just deleting/modifying the cache, seriously!

### What else do you feel I should add here?

Send me a PR or create an issue. Thanks!
