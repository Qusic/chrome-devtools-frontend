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
  hook(Root.Runtime.prototype, 'extensions', (object, original) => (type, context, sortByTitle) => {
    const extensions = original()
    if (type === 'view') {
      return extensions.filter(extension => {
        const {location, id} = extension.descriptor()
        switch (location) {
          case 'panel':
            switch (id) {
              case 'elements': return true
              case 'console': return true
              case 'sources': return true
              case 'network': return true
              case 'resources': return true
              default: return false
            }
            return true
          case 'drawer-view':
            switch (id) {
              case 'console-view': return true
              default: return false
            }
          default: return true
        }
      })
    } else {
      return extensions
    }
  })
  require('chrome-devtools-frontend/front_end/root')
  require('chrome-devtools-frontend/front_end/devtools_app')
})()
