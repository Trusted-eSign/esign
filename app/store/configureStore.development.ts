import { routerMiddleware } from "react-router-redux";
import { applyMiddleware, compose, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import history from "../history";
import randomId from "../middlewares/randomId";
import reducer from "../reducer/index";
import preloadedState from "./preloadedState";

const router = routerMiddleware(history);

const composeEnhancers =
  typeof window === "object" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose

const logger = createLogger({
  level: "info",
  collapsed: true,
});

const enhancer = composeEnhancers(
  applyMiddleware(logger, thunk, router, randomId),
);

const store = createStore(reducer, preloadedState, enhancer);

if (module.hot) {
  module.hot.accept("../reducer", () =>
    store.replaceReducer(require("../reducer")), // eslint-disable-line global-require
  );
}

export default store;
