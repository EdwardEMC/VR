const staticCacheName = 'site-static-v1';
const assets = [
  '/',
  '/assets/css/style.css',
  '/assets/css/XRstyle.css',

  '/assets/js/jquery/jquery-3.4.1.js',

  '/assets/js/render/core/material.js',
  '/assets/js/render/core/node.js',
  '/assets/js/render/core/primitive.js',
  '/assets/js/render/core/program.js',
  '/assets/js/render/core/renderer.js',
  '/assets/js/render/core/texture.js',

  '/assets/js/render/geometry/primitive-stream.js',
  '/assets/js/render/loaders/gltf2.js',
  '/assets/js/render/materials/pbr.js',
  '/assets/js/render/math/gl-matrix.js',
  '/assets/js/render/math/ray.js',
  '/assets/js/render/nodes/button.js',
  '/assets/js/render/nodes/gltf2.js',
  '/assets/js/render/nodes/input-renderer.js',
  '/assets/js/render/nodes/video-skybox.js',

  '/assets/js/third-party/gl-matrix/src/gl-matrix/common.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/mat2.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/mat2d.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/mat3.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/mat4.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/quat.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/quat2.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/vec2.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/vec3.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix/vec4.js',
  '/assets/js/third-party/gl-matrix/src/gl-matrix.js',
  '/assets/js/third-party/webxr-polyfill/build/webxr-polyfill.module.js',
  '/assets/js/third-party/dat.gui.min.js',

  '/assets/js/util/inline-viewer-helper.js',
  '/assets/js/util/query-args.js',
  '/assets/js/util/webxr-button.js',

  '/assets/js/webxr/webxr_basic.js',
  '/assets/js/webxr/webxr.js',

  '/assets/js/app.js',

  '/assets/media/buttons/fullscreen.png',
  '/assets/media/buttons/mic-button.png',
  '/assets/media/buttons/options-button.png',
  '/assets/media/buttons/pause-button.png',
  '/assets/media/buttons/play-button.png',
  '/assets/media/buttons/restart-button.png',

  '/assets/media/icons/icon-192x192.png',
  '/assets/media/icons/icon-512x512.png',

  '/assets/media/video/sample.mp4',
];

// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch event
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});