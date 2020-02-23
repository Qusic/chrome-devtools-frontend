const context = require.context('chrome-devtools-frontend/front_end', true, /\.js$/)

function hook(object, name, callback) {
  const original = object[name]
  object[name] = function() {
    return callback(this, () => original.apply(this, arguments))(...arguments)
  }
  return () => object[name] = original
}

(async () => {
  const {serviceWorker} = navigator
  if (!serviceWorker) return
  await serviceWorker.register('/sw.js')
  await serviceWorker.ready
  require('chrome-devtools-frontend/front_end/Runtime')
  hook(Root.Runtime.Module.prototype, '_loadModules', (object, original) => () => {
    let path
    const restore = hook(self, 'eval', (object, original) => (string) => {
      path = string.match(/^import\('(.*)'\)$/)[1]
    })
    original()
    restore()
    context(path)
  })
  require('chrome-devtools-frontend/front_end/root')
  require('chrome-devtools-frontend/front_end/devtools_app')
})()
