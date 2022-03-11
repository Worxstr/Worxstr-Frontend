/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

importScripts(
<<<<<<< HEAD
  "/precache-manifest.126e0e15d0e2f24d0912a44656902462.js"
=======
<<<<<<< Updated upstream
  "/precache-manifest.52c744c154f9799a2f130f2b789680d6.js"
=======
  "/precache-manifest.b1e7997cd24d3f7fb0a1379dd69ca557.js"
>>>>>>> Stashed changes
>>>>>>> e625c27c346bf423dbf0266f955e34b95aaff5d4
);

workbox.core.setCacheNameDetails({prefix: "worxstr"});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
