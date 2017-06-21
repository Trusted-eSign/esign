import * as React from "react";
import {render} from "react-dom";
import Root from "./components/Root";
import store from "./store/index";

import * as native from "./native";
import { Store } from "./trusted/store";

const remote = window.electron.remote;
if (remote.getGlobal("sharedObject").logcrypto) {
  window.logger = trusted.utils.Logger.start(native.path.join(native.os.homedir(), ".Trusted", "trusted-crypto.log"));
}

const STORE = new Store();
STORE.importCert(native.DEFAULT_PATH + "/cert1.crt");
STORE.importKey(native.DEFAULT_PATH + "/cert1.key", "");

window.PKISTORE = STORE;
window.TRUSTEDCERTIFICATECOLLECTION = STORE.trustedCerts;
window.PKIITEMS = STORE.items;

render(<Root store = {store} />, document.getElementById("container"));
