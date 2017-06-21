import {applyMiddleware, compose, createStore} from "redux";
import thunk from "redux-thunk";
import history from "../history";
import logger from "../middlewares/logger";
import reducer from "../reducer/index";

const enhancer = applyMiddleware(thunk, logger);

const store = createStore(reducer, {}, enhancer);

//dev only
window.store = store;

export default store;
