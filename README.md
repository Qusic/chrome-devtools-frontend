# [Chrome DevTools Frontend](https://github.com/ChromeDevTools/devtools-frontend)

## Features

* Bundled with webpack into 3 files: index.html, main.js, sw.js
* Compiled with babel for better browser compatibility
* Resource files are served from service worker

## Known Issues

* Production mode build is failing for a terser error
* Not working on Safari and iOS because of [regex lookbehind assertions](https://bugs.webkit.org/show_bug.cgi?id=174931)
