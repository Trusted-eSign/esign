import { CHANGE_SEARCH_VALUE, LOAD_ALL_CERTIFICATES, SELECT_SIGNER_CERTIFICATE,
   START, SUCCESS, VERIFY_CERTIFICATE } from "../constants";
import { certVerify } from "../module/global_app";
import * as native from "../native";
import { Store } from "../trusted/store";

export function loadAllCertificates() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_CERTIFICATES + START,
    });

    setTimeout(() => {
      const certificateStore = new Store();
      certificateStore.importCert(native.DEFAULT_PATH + "/cert1.crt");
      certificateStore.importKey(native.DEFAULT_PATH + "/cert1.key", "");

      window.PKISTORE = certificateStore;
      window.TRUSTEDCERTIFICATECOLLECTION = certificateStore.trustedCerts;
      window.PKIITEMS = certificateStore.items;

      const certs = certificateStore.items.filter(function(item: trusted.pkistore.PkiItem) {
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

export function changeSearchValue(searchValue) {
  return {
    payload: { searchValue },
    type: CHANGE_SEARCH_VALUE,
  };
}

export function verifyCertificate(certificateId) {
  return (dispatch, getState) => {
    const { certificates } = getState();
    const certificateStatus = certVerify(certificates.getIn(["entities", certificateId]), window.TRUSTEDCERTIFICATECOLLECTION);

    dispatch({
      payload: { certificateId, certificateStatus },
      type: VERIFY_CERTIFICATE,
    });
  };
}

export function selectSignerCertificate(selected) {
  return {
    payload: { selected },
    type: SELECT_SIGNER_CERTIFICATE,
  };
}
