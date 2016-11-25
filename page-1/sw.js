importScripts("../toolbox.js");
console.log("Hello from page-1 service-worker");

const CACHE_NAME = "MY-CACHE";

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
