const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/main.css',
  './script/main.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('fetch', function (event) {
  event.preventDefault();
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // 来来来，代理可以搞一些代理的事情

      // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
      if (response) {
        console.log(response);
        return response;
      }
      console.log('next');
      // 如果 service worker 没有返回，那就得直接请求真实远程服务
      const request = event.request.clone(); // 把原始请求拷过来
      return fetch(request).then(function (httpRes) {

        // http请求的返回已被抓到，可以处置了。

        // 请求失败了，直接返回失败的结果就好了。。
        if (!httpRes || httpRes.status !== 200) {
          return httpRes;
        }

        // 请求成功的话，将请求缓存起来。
        const responseClone = httpRes.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });

        return httpRes;
      }).catch(function(err){
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    })
  );
});
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//           // Cache hit - return response
//           if (response) {
//             return response;
//           }
//           return fetch(event.request);
//         }
//       )
//   );
// });
