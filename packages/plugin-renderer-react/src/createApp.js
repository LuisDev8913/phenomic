import * as React from "react";
import ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import Provider from "./components/Provider";
import createStore from "./shared/store";

const debug = require("debug")("phenomic:plugin:renderer-react");

const render =
  typeof document !== "undefined" &&
  !document.querySelector("#phenomic-DevLoader") &&
  ReactDOM.hydrate
    ? ReactDOM.hydrate
    : ReactDOM.render;

let store;

export const renderApp = (routes: () => React.Element<any>) => {
  debug("client rendering");

  const initialStateNode = document.getElementById("PhenomicHydration");
  store =
    store ||
    createStore(
      initialStateNode && initialStateNode.textContent
        ? JSON.parse(initialStateNode.textContent)
        : undefined
    );

  let root = document.getElementById("PhenomicRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "PhenomicRoot";
    if (!document.body) {
      throw new Error("Rendering the app without a body element is impossible");
    }
    document.body.appendChild(root);
  }

  render(
    <AppContainer>
      <Provider store={store}>{routes()}</Provider>
    </AppContainer>,
    root
  );
};

export default (routes: () => React.Element<any>): PhenomicAppType => {
  if (typeof window !== "undefined") {
    renderApp(routes);
  }
  return {
    routes: routes()
  };
};
