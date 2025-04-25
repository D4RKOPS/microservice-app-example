require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port || 8080

// --- NUEVA LÍNEA: Lee la variable de entorno HOST ---
// Usa 0.0.0.0 por defecto si HOST no está definida (para K8s)
// o usa 'localhost' si NODE_ENV no está definido (para desarrollo local)
var host = process.env.HOST || (process.env.NODE_ENV ? '0.0.0.0' : 'localhost');
// --- Fin NUEVA LÍNEA ---


// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: false,
  heartbeat: 2000
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  // Aquí es donde se configuran los proxies. Asegúrate de que
  // la URL base del proxy apunte a API_BASE_URL (esto no se configura aquí,
  // sino donde se define proxyTable, probablemente en config/index.js)
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// --- LÍNEA MODIFICADA: Usa la variable 'host' en lugar de 127.0.0.1 ---
var uri = 'http://' + host + ':' + port
// --- Fin LÍNEA MODIFICADA ---

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  // El mensaje de log ahora reflejará el host real (0.0.0.0 en K8s)
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    // Si HOST es 0.0.0.0, opn podría no funcionar correctamente.
    // Podrías necesitar una lógica aquí para usar 'localhost' para opn
    // si HOST es 0.0.0.0.
    opn(uri)
  }
  _resolve()
})

// --- LÍNEA MODIFICADA: Pasa la variable 'host' a app.listen ---
var server = app.listen(port, host)
// --- Fin LÍNEA MODIFICADA ---

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
