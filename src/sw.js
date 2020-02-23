const context = require.context('chrome-devtools-frontend/front_end?data', true, /(\.(json|css|png|svg)|\/audits\/lighthouse\/[^/.]+\.(html|js))$/)

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(clients.claim()))

self.addEventListener('fetch', event => {
  const {request} = event
  if (request.method != 'GET') return
  const url = new URL(request.url)
  if (url.origin != location.origin) return
  const path = `.${url.pathname}`
  try {
    const data = context(path).default
    event.respondWith(fetch(data))
  } catch (error) {}
})
