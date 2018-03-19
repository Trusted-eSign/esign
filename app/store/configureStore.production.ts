import { routerMiddleware } from "react-router-redux";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import history from "../history";
import randomId from "../middlewares/randomId";
import reducer from "../reducer/index";
import preloadedState from "./preloadedState";

const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router, randomId);

const store = createStore(reducer, preloadedState, enhancer);

export default store;
