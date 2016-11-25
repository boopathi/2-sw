importScripts("toolbox.js");
console.log("Hello from Root service-worker");

const CACHE_NAME = "MY-CACHE";

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
