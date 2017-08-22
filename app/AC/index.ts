import {
  ACTIVE_FILE, CHANGE_SEARCH_VALUE, DELETE_FILE,
  FAIL, LOAD_ALL_CERTIFICATES, SELECT_FILE,
  SELECT_SIGNER_CERTIFICATE, START, SUCCESS,
  VERIFY_CERTIFICATE, VERIFY_SIGNATURE,
} from "../constants";
import { certVerify } from "../module/global_app";
import * as native from "../native";
import * as signs from "../trusted/sign";
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

export function verifySignature(fileId: string) {
  return (dispatch, getState) => {
    const { files } = getState();
    const file = files.getIn(["entities", fileId]);
    let signaruteStatus = false;
    let signatureInfo;
    let cms: trusted.cms.SignedData;

    try {
      cms = signs.loadSign(file.fullpath);

      if (cms.isDetached()) {
        if (!(cms = signs.setDetachedContent(cms, file.fullpath))) {
          throw("err");
        }
      }

      signaruteStatus = signs.verifySign(cms);
      signatureInfo = signs.getSignPropertys(cms);
      signatureInfo = signatureInfo.map((info) => {
        return {...info, fileId};
      });

    } catch (error) {
      dispatch({
        payload: {error, fileId},
        type: VERIFY_SIGNATURE + FAIL,
    });
    }

    dispatch({
      generateId: true,
      payload: { fileId, signaruteStatus, signatureInfo },
      type: VERIFY_SIGNATURE + SUCCESS,
    });
  };
}
