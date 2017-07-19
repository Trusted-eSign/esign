import { createBrowserHistory } from "history";
import { routerMiddleware } from "react-router-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import reducer from "../reducer/index";

const history = createBrowserHistory();
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

const store = createStore(reducer, {}, enhancer);

export default store;
