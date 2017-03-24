/// <reference types="materialize-css" />
/// <reference types="react" />
/// <reference types="nw.gui" />
/// <reference path="../../types/index.d.ts" />
/// <reference path="../../src/index.d.ts" />

import * as ReactDom from "react-dom";
import { router } from "./app";
import * as native from "./native";
import { STORE } from "./trusted/store";

STORE.importCert(native.DEFAULT_PATH + "/cert1.crt");
STORE.importKey(native.DEFAULT_PATH + "/cert1.key", "");

window.PKISTORE = STORE;
window.TRUSTEDCERTIFICATECOLLECTION = STORE.trustedCerts;
window.PKIITEMS = STORE.items;

ReactDom.render(router, document.getElementById("container"));
