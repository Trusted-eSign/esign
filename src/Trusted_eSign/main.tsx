/// <reference types="materialize-css" />
/// <reference types="react" />
/// <reference types="nw.gui" />
/// <reference path="../../types/index.d.ts" />

import * as ReactDom from "react-dom";
import * as native from "./native";
import { STORE } from "./trusted/store";
import { router } from "./app";

STORE.importCert(native.DEFAULT_PATH + "/cert1.crt");
STORE.importKey(native.DEFAULT_PATH + "/cert1.key", "");

interface MyWindow  extends Window{
    CERTIFICATECOLLECTION: trusted.pki.CertificateCollection;
    PKIITEMS: Array<trusted.pkistore.PkiItem>;
    PKISTORE: trusted.pkistore.PkiStore
}
declare var window: MyWindow;

window.PKISTORE = STORE;
window.CERTIFICATECOLLECTION = STORE.certs;
window.PKIITEMS = STORE.items;

ReactDom.render(router, document.getElementById("container"));
