(function () {
    'use strict';

    let staticCacheName = "restaurant-v2";

    const urlsToCache = [
        "/",
        "/index.html",
        "/restaurant.html",
        "/css/styles.css",       
        "/js/idb.js",
        "/js/idbhelper.js",
        "/js/dbhelper.js",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/js/register_service_worker.js",
        "/manifest.json"
    ];

    self.addEventListener("install", event => {
        event.waitUntil(
            caches.open(staticCacheName).then(cache => {
                return cache
                    .addAll(urlsToCache)
                    .catch(err => {
                        console.log("Cache Open failed in service worker " + err);
                    })
            })
        );
    });


    self.addEventListener("activate", event => {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.filter(cacheName => {
                        return cacheName.startsWith("restaurant-") &&
                            cacheName != staticCacheName
                    }).map(cacheName => {
                        return caches.delete(cacheName);
                    })
                )
            })
        );
    });

    
    self.addEventListener("fetch", event => {
        let type = '';
        let requestUrl = new URL(event.request.url);

        if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
            type = '/index.html';
        } else if (requestUrl.pathname.indexOf('/restaurant.html') > -1) {
            type = '/restaurant.html';
        }

        if (type != '') {
            event.respondWith(
                caches.open(staticCacheName).then(cache => {
                    return cache.match(type).then(response => {
                        console.log("type...", type);
                        console.log("response...", response);
                        let fetchPromise = fetch(type)
                            .then(ntwkResponse => {
                                cache.put(type, ntwkResponse.clone());
                                return ntwkResponse;
                            });
                        return response || ntwkResponse;
                    });
                })
            );
        }
        else if (urlsToCache.includes(requestUrl.href) || urlsToCache.includes(requestUrl.pathname)) {
            event.respondWith(
                caches.open(staticCacheName).then(cache => {
                    return cache.match(event.request).then(response => {
                        return response || fetch(event.request);
                    });
                }).catch(err => {
                    console.log("err in fetch for " + event.request.url, err);
                })
            )
        }
    });

    // self.addEventListener("fetch", event => {
    //     const cacheRequest = event.request;        
    //     event.respondWith(
    //         caches.match(cacheRequest).then(resp => {
    //             return resp || fetch(event.request).then(response => {
    //                 let responseClone = response.clone();

    //                 caches.open(staticCacheName).then(cache => {
    //                     cache.put(event.request, responseClone)
    //                 })
    //                 return response;
    //             })
    //         }).catch(err => {
    //             console.log("err in fetch for " + event.request.url, err);
    //         })
    //     )
    // });    
})();