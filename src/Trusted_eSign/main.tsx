/// <reference types="materialize-css" />
/// <reference types="react" />
/// <reference types="nw.gui" />
/// <reference path="../../types/index.d.ts" />
/// <reference path="../../src/index.d.ts" />

import * as ReactDom from "react-dom";
import { router } from "./app";
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

ReactDom.render(router, document.getElementById("container"));
