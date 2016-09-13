import { join } from "path"
import express, { Router } from "express"
import webpack from "webpack"
import webpackDevMiddleware from "webpack-dev-middleware"
import webpackHotMiddleware from "webpack-hot-middleware"
import historyFallbackMiddleware from "connect-history-api-fallback"
import WebpackNotifierPlugin from "webpack-notifier"

import opn from "opn"
import debug from "debug"
import portFinder from "portfinder"

import PhenomicLoaderWebpackPlugin from "../loader/plugin.js"
import minifyCollection from "../loader/minify"
import serialize from "../_utils/serialize"
import pathToUri from "../_utils/path-to-uri"

const log = debug("phenomic:builder:server")

export default (config) => {
  const { webpackConfigBrowser: webpackConfig } = config

  if (!config.baseUrl) {
    throw new Error(
      "You must provide a 'baseUrl' object that contains the following keys:" +
      "'href', 'port', 'hostname'. See https://nodejs.org/api/url.html"
    )
  }

  const server = express()

  if (config.static && config.server) {
    server.use(
      config.baseUrl.pathname,
      express.static(join(config.cwd, config.destination))
    )
  }
  else {
    const devEntries = [
      require.resolve("webpack-hot-middleware/client"),
    ]

    const devConfig = {
      ...webpackConfig,
      entry: {
        // add devEntries
        ...Object.keys(webpackConfig.entry).reduce((acc, key) => ({
          ...acc,
          [key]: [
            ...devEntries,
            ...Array.isArray(webpackConfig.entry[key])
              ? webpackConfig.entry[key]
              : [ webpackConfig.entry[key] ],
          ],
        }), {}),
      },
      plugins: [
        ...(webpackConfig.plugins || []),

        // for hot-middleware
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),

        new WebpackNotifierPlugin(),
      ],
      eslint: {
        ...webpackConfig.eslint,
        emitWarning: true,
      },
    }

    // webpack dev + hot middlewares
    const webpackCompiler = webpack(devConfig)
    server.use(webpackDevMiddleware(webpackCompiler, {
      publicPath: webpackConfig.output.publicPath,
      noInfo: !config.verbose,
      ...devConfig.devServer,
    }))
    server.use(webpackHotMiddleware(webpackCompiler))

    let entries = []
    webpackCompiler.plugin("done", function(stats) {
      log("Webpack compilation done")

      // reset entries
      entries = []
      const namedChunks = stats.compilation.namedChunks
      Object.keys(namedChunks).forEach((chunkName) => {
        entries = [
          ...entries,
          ...namedChunks[chunkName].files.filter(
            (file) => !file.endsWith(".hot-update.js")
          ),
        ]
      })
    })

    // user static assets
    if (config.assets) {
      server.use(
        config.baseUrl.pathname + config.assets.route,
        express.static(config.assets.path)
      )
    }

    // routing for the part we want (starting to the baseUrl pathname)
    const router = Router()
    server.use(config.baseUrl.pathname, router)

    // fallback to index for unknow pages?
    router.use(historyFallbackMiddleware())

    // webpack static ressources
    router.get("*", express.static(webpackConfig.output.path))

    // hardcoded entry point
    router.get("/index.html", (req, res) => {
      const collectionMin = minifyCollection(
        PhenomicLoaderWebpackPlugin.collection
      )
      res.setHeader("Content-Type", "text/html")
      /* eslint-disable max-len */
      res.end(
  `<!doctype html>
  <html>
  <head><meta charset="utf8" /></head>
  <body>
    <div id="phenomic">
      <div
        id="phenomic-DevLoader"
        style="color: red; font: caption; text-align: center; line-height: 100vh; font-size: 2rem;"
      >
        <script>
        window.onerror = function(e) {
          var devLoader = document.querySelector("#phenomic-DevLoader")
          if (devLoader) { devLoader.innerHTML = e.toString() }
          // only need to use this code once
          window.onerror = null
        }
        </script>
      </div>
    </div>
    <script>
    window.__COLLECTION__ = ${
      serialize(collectionMin)
    };
    </script>
    ${
      entries.map((fileName) =>
        `<script src="${
          pathToUri(config.baseUrl.pathname, fileName)
        }"></script>`
      )
    }
  </body>
  </html>`
      /* eslint-enable max-len */
      )
    })
  }

  // THAT'S IT
  const { devHost, devPort } = config

  portFinder.basePort = devPort

  portFinder.getPort((err, port) => {
    if (err) {
      throw err
    }

    if (port !== devPort) {
      log(`Port ${ devPort } is not available. Using port ${ port } instead.`)
    }
    server.listen(port, devHost, (err) => {
      if (err) {
        throw err
      }
      const href = `http://${ devHost }:${ port }${ config.baseUrl.pathname }`
      log(`Dev server started on ${ href }`)
      if (config.open) {
        opn(href.replace(devHost, "localhost"))
      }
    })
  })
}
