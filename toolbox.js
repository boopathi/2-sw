console.log("Hello from Toolbox");
async function cacheOnly(cachename, request) {
  const cache = await caches.open(cachename);
  return await cache.match(request.clone());
}

async function writeCache(cachename, request, response) {
  const cache = await caches.open(cachename);
  return await cache.put(request.clone(), response.clone());
}

async function removeFromCache(cachename, request) {
  const cache = await caches.open(cachename);
  return await cache.delete(request.clone());
}

async function precache(cachename, resources) {
  const cache = await caches.open(cachename);
  return await cache.addAll(resources);
}
