import * as React from "react";
import {render} from "react-dom";
import "./app.global.css";
import Root from "./components/Root";
import * as native from "./native";
import store from "./store/index";
import { Store } from "./trusted/store";

// const remote = window.electron.remote;
// if (remote.getGlobal("sharedObject").logcrypto) {
//   window.logger = trusted.utils.Logger.start(native.path.join(native.os.homedir(), ".Trusted", "trusted-crypto.log"));
// }

render(<Root store = {store} />, document.getElementById("container"));
