import { LOAD_ALL_CERTIFICATES, START, SUCCESS } from "../constants";
import * as native from "../native";
import { Store } from "../trusted/store";

export function loadAllCertificates() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_CERTIFICATES + START,
    });

    setTimeout(() => {
      const STORE = new Store();
      STORE.importCert(native.DEFAULT_PATH + "/cert1.crt");
      STORE.importKey(native.DEFAULT_PATH + "/cert1.key", "");

      window.PKISTORE = STORE;
      window.TRUSTEDCERTIFICATECOLLECTION = STORE.trustedCerts;
      window.PKIITEMS = STORE.items;

      const certs = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
        if (!item.id) {
          item.id = Date.now() + Math.random();
        }
        return item.type === "CERTIFICATE";
      });

      dispatch({
        certs,
        type: LOAD_ALL_CERTIFICATES + SUCCESS,
      });
    }, 0);
  };
}
