import {
  ACTIVE_FILE, CHANGE_SEARCH_VALUE, DELETE_FILE,
  LOAD_ALL_CERTIFICATES, SELECT_FILE, SELECT_SIGNER_CERTIFICATE,
  START, SUCCESS, VERIFY_CERTIFICATE,
} from "../constants";
import { certVerify } from "../module/global_app";
import * as native from "../native";
import { Store } from "../trusted/store";
import { extFile } from "../utils";

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

      const certs = certificateStore.items.filter(function (item: trusted.pkistore.PkiItem) {
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

export function selectFile(fullpath: string) {
  const stat = native.fs.statSync(fullpath);
  const file = {
    extension: extFile(fullpath),
    filename: native.path.basename(fullpath),
    fullpath: fullpath,
    lastModifiedDate: stat.birthtime,
    size: stat.size,
  };

  return {
    generateId: true,
    payload: { file },
    type: SELECT_FILE,
  };
}

export function activeFile(fileId: string, isActive: boolean = true) {
  return {
    payload: { fileId, isActive },
    type: ACTIVE_FILE,
  };
}

export function deleteFile(fileId: string) {
  return {
    payload: { fileId },
    type: DELETE_FILE,
  };
}
