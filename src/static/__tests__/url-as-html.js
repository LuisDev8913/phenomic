/* eslint-disable max-len */

import url from "url"

import test from "jest-ava-api"

import beautifyHTML from "../../_utils/beautify-html"
import htmlMetas from "../../_utils/html-metas"
import urlAsHtml from "../url-as-html"

import collection from "./fixtures/collection.js"
import store from "./fixtures/store.js"

test("url as html", async (t) => {
  const html = await urlAsHtml(
    "/",
    {
      routes: require("./fixtures/routes.js").default,
      collection,
      store,
      baseUrl: url.parse("http://0.0.0.0:3000/"),
      assetsFiles: {
        js: [ "test.js" ],
      },
      clientScripts: true,
    },
    undefined, // Html
  )

  const expectedHTML = (
`<!doctype html>
<html lang="en">

<head>
  ${ htmlMetas({ baseUrl: { pathname: "/" } }).join("\n  ") }
  <title data-react-helmet="true"></title>
</head>

<body>
  <div id="phenomic">
    <p data-reactroot="" data-reactid="1" data-react-checksum="305402615">TestContainer</p>
  </div>
  <script>
    window.__COLLECTION__ = [{
      "__url": "/",
      "__resourceUrl": "/index.html"
    }, {
      "__url": "/test-url",
      "__resourceUrl": "/test-url/index.html"
    }];
    window.__INITIAL_STATE__ = {
      "pages": {
        "/": {
          "home": "page"
        }
      }
    }
  </script>
  <script src="/test.js"></script>
</body>

</html>`)
  t.is(beautifyHTML(html),  expectedHTML)
})

test("url as html without JS", async (t) => {
  const html = await urlAsHtml(
    "/",
    {
      routes: require("./fixtures/routes.js").default,
      collection,
      store,
      baseUrl: url.parse("http://0.0.0.0:3000/"),
      assetsFiles: {
        js: [ "test.js" ],
      },
      clientScripts: false,
    },
    undefined, // Html
  )

  const expectedHTML = (
`<!doctype html>
<html lang="en">

<head>
  ${ htmlMetas({ baseUrl: { pathname: "/" } }).join("\n  ") }
  <title data-react-helmet="true"></title>
</head>

<body>
  <div id="phenomic">
    <p>TestContainer</p>
  </div>
</body>

</html>`)
  t.is(beautifyHTML(html),  expectedHTML)
})

test("baseUrl with offline support", async (t) => {
  const html = await urlAsHtml(
    "/",
    {
      routes: require("./fixtures/routes.js").default,
      collection,
      store,
      offline: true,
      offlineConfig: {
        serviceWorker: true,
        appcache: true,
      },
      baseUrl: url.parse("http://0.0.0.0:3000/phenomic"),
      assetsFiles: {
        js: [ "test.js" ],
      },
      clientScripts: true,
    },
    undefined, // Html
  )

  const expectedHTML = (
`<!doctype html>
<html lang="en">

<head>
  ${ htmlMetas({ baseUrl: { pathname: "/phenomic" } }).join("\n  ") }
  <title data-react-helmet="true"></title>
</head>

<body>
  <div id="phenomic">
    <p data-reactroot="" data-reactid="1" data-react-checksum="305402615">TestContainer</p>
  </div>
  <script>
    window.__COLLECTION__ = [{
      "__url": "/",
      "__resourceUrl": "/index.html"
    }, {
      "__url": "/test-url",
      "__resourceUrl": "/test-url/index.html"
    }];
    window.__INITIAL_STATE__ = {
      "pages": {
        "/": {
          "home": "page"
        }
      }
    }
  </script>
  <script src="/phenomic/test.js"></script>
</body>

</html>`)
  t.is(beautifyHTML(html),  expectedHTML)
})

test("custom script tags", async (t) => {
  const html = await urlAsHtml(
    "/",
    {
      routes: require("./fixtures/routesWithCustomScript.js").default,
      collection,
      store,
      baseUrl: url.parse("http://0.0.0.0:3000/"),
      assetsFiles: {
        js: [ "test.js" ],
      },
      clientScripts: true,
    },
    undefined, // Html
  )

  const expectedHTML = (
`<!doctype html>
<html lang="en">

<head>
  ${ htmlMetas({ baseUrl: { pathname: "/" } }).join("\n  ") }
  <title data-react-helmet="true"></title>
</head>

<body>
  <div id="phenomic">
    <div data-reactroot="" data-reactid="1" data-react-checksum="1089807005">
      <!-- react-empty: 2 -->
      <p data-reactid="3">TestContainer</p>
    </div>
  </div>
  <script>
    window.__COLLECTION__ = [{
      "__url": "/",
      "__resourceUrl": "/index.html"
    }, {
      "__url": "/test-url",
      "__resourceUrl": "/test-url/index.html"
    }];
    window.__INITIAL_STATE__ = {
      "pages": {
        "/": {
          "home": "page"
        }
      }
    }
  </script>
  <script data-react-helmet="true" src="http://foo.bar/baz.js"></script>
  <script src="/test.js"></script>
</body>

</html>`)
  t.is(beautifyHTML(html),  expectedHTML)
})
