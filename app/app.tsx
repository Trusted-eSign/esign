import * as React from "react";
import ReactDOM from "react-dom";
import "./app.global.css";
import Root from "./components/Root";
import store from "./store/index";

ReactDOM.render(<Root store = {store} />, document.getElementById("container"));
