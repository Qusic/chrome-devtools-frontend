const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const sourcePath = path.join(__dirname, 'src')
const buildPath = path.join(__dirname, 'out')
const devtoolsPath = path.join(__dirname, 'node_modules', 'chrome-devtools-frontend')
const frontendPath = path.join(devtoolsPath, 'front_end')

const isModule = value => resource => {
  if (!resource.endsWith('.js')) return false
  if (resource.startsWith(sourcePath)) return value
  if (!resource.startsWith(frontendPath)) return false
  const file = resource.substring(frontendPath.length).split(path.sep).slice(1)
  switch (file[0]) {
    case 'cm':
      switch (file[1]) {
        case 'cm.js': return value
        default: return !value
      }
    case 'cm_headless':
      switch (file[1]) {
        case 'cm_headless.js': return value
        default: return !value
      }
    case 'cm_modes':
      switch (file[1]) {
        case 'cm_modes.js': return value
        case 'DefaultCodeMirrorMimeMode.js': return value
        default: return !value
      }
    case 'cm_web_modes':
      switch (file[1]) {
        case 'cm_web_modes_cm.js': return value
        case 'cm_web_modes_headless.js': return value
        case 'cm_web_modes.js': return value
        default: return !value
      }
    case 'audits':
      switch (file[1]) {
        case 'lighthouse': return !value
        default: return value
      }
    case 'audits_worker':
      switch (file[1]) {
        case 'lighthouse': return !value
        default: return value
      }
  }
  return value
}

const processModule = resource => {
  resource.request = (() => {
    switch (resource.request) {
      case './externs.js': return '../../../src/stub'
      case '../third_party/lighthouse/report-assets/report.js': return '../../../../src/stub'
      case '../third_party/lighthouse/report-assets/report-generator.js': return '../../../../src/stub'
      case '../third_party/wasmparser/WasmDis.js': return '../../../../node_modules/wasmparser/esm/WasmDis'
      case '../third_party/wasmparser/WasmParser.js': return '../../../../node_modules/wasmparser/esm/WasmParser'
      default: return resource.request
    }
  })()
}

module.exports = {
  context: sourcePath,
  output: {
    path: buildPath,
    publicPath: '/',
    filename: '[name].js'
  },
  entry: {
    main: './main',
    sw: './sw'
  },
  module: {
    rules: [{
      resource: isModule(true),
      loader: 'babel-loader'
    }, {
      resource: isModule(false),
      loader: 'imports-loader',
      options: {
        module: '>false',
        exports: '>false',
        define: '>false',
      },
      parser: {
        amd: false,
        commonjs: false,
        system: false,
        harmony: false,
        requireInclude: false,
        requireEnsure: false,
        requireContext: false,
        browserify: false,
        requireJs: false,
        node: false
      }
    }, {
      resourceQuery: /^\?data$/,
      type: 'javascript/auto',
      loader: 'url-loader'
    }]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.NormalModuleReplacementPlugin(/./, processModule),
    new HtmlPlugin({
      template: './index.html',
      chunks: ['main'],
      inject: 'head',
      minify: {collapseWhitespace: true}
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin()
    ]
  },
  performance: {
    hints: false
  },
  devServer: {
    host: 'localhost',
    port: '8080',
    historyApiFallback: true
  }
}
