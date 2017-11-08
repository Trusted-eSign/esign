import * as fs from "fs";
import * as path from "path";
import {
  ACTIVE_FILE, ADD_RECIPIENT_CERTIFICATE, CHANGE_ARCHIVE_FILES_BEFORE_ENCRYPT,
  CHANGE_DELETE_FILES_AFTER_ENCRYPT, CHANGE_ECRYPT_ENCODING,
  CHANGE_ENCRYPT_OUTFOLDER, CHANGE_LOCALE, CHANGE_SEARCH_VALUE,
  CHANGE_SIGNATURE_DETACHED, CHANGE_SIGNATURE_ENCODING, CHANGE_SIGNATURE_OUTFOLDER,
  CHANGE_SIGNATURE_TIMESTAMP,  DELETE_FILE, DELETE_RECIPIENT_CERTIFICATE,
  FAIL, LICENSE_PATH, LOAD_ALL_CERTIFICATES, LOAD_LICENSE,
  REMOVE_ALL_CERTIFICATES, SELECT_FILE,
  SELECT_SIGNER_CERTIFICATE, START, SUCCESS,
  VERIFY_CERTIFICATE, VERIFY_LICENSE, VERIFY_SIGNATURE,
} from "../constants";
import { DEFAULT_PATH } from "../constants";
import { certVerify } from "../module/global_app";
import * as signs from "../trusted/sign";
import { Store } from "../trusted/store";
import { extFile, toBase64 } from "../utils";

export function loadLicense() {
  return (dispatch) => {
    dispatch({
      type: LOAD_LICENSE + START,
    });

    setTimeout(() => {
      let data;
      let parsedLicense;
      let buffer;

      if (fs.existsSync(LICENSE_PATH)) {
        data = fs.readFileSync(LICENSE_PATH, "utf8");
      }

      if (data && data.length) {
        const splitLicense = data.split(".");

        if (splitLicense[1]) {
          try {
            buffer = new Buffer(toBase64(splitLicense[1]), "base64").toString("utf8");
            parsedLicense = JSON.parse(buffer);

            if (parsedLicense.exp && parsedLicense.aud && parsedLicense.iat && parsedLicense.iss
              && parsedLicense.jti && parsedLicense.sub) {
              dispatch({
                lic: parsedLicense,
                type: LOAD_LICENSE + SUCCESS,
              });
            } else {
              dispatch({
                type: LOAD_LICENSE + FAIL,
              });
            }
          } catch (e) {
            dispatch({
              type: LOAD_LICENSE + FAIL,
            });
          }
        } else {
          dispatch({
            type: LOAD_LICENSE + FAIL,
          });
        }
      }
    }, 0);
  };
}

export function loadAllCertificates() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_CERTIFICATES + START,
    });

    setTimeout(() => {
      const certificateStore = new Store();

      try {
        const certificate = trusted.pki.Certificate.load(DEFAULT_PATH + "/cert1.crt", trusted.DataFormat.PEM);
        certificateStore.importCertificate(certificate);
        certificateStore.importKey(DEFAULT_PATH + "/cert1.key", "");
      } catch (e) {
        alert(`Error import test certificate! \n ${e}`);
      }

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

export function removeAllCertificates() {
  return {
    type: REMOVE_ALL_CERTIFICATES,
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
  const stat = fs.statSync(fullpath);
  const file = {
    extension: extFile(fullpath),
    filename: path.basename(fullpath),
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
        return {
          fileId,
          ...info,
           id: Date.now() + Math.random(),
           status_verify: signaruteStatus};
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

export function changeSignatureEncoding(encoding) {
  return {
    payload: { encoding },
    type: CHANGE_SIGNATURE_ENCODING,
  };
}

export function changeSignatureDetached(detached: boolean) {
  return {
    payload: { detached },
    type: CHANGE_SIGNATURE_DETACHED,
  };
}

export function changeSignatureTimestamp(timestamp: boolean) {
  return {
    payload: { timestamp },
    type: CHANGE_SIGNATURE_TIMESTAMP,
  };
}

export function changeSignatureOutfolder(outfolder: string) {
  return {
    payload: { outfolder },
    type: CHANGE_SIGNATURE_OUTFOLDER,
  };
}

export function changeEncryptEncoding(encoding: string) {
  return {
    payload: { encoding },
    type: CHANGE_ECRYPT_ENCODING,
  };
}

export function changeDeleteFilesAfterEncrypt(del: boolean) {
  return {
    payload: { del },
    type: CHANGE_DELETE_FILES_AFTER_ENCRYPT,
  };
}

export function changeArchiveFilesBeforeEncrypt(archive: boolean) {
  return {
    payload: { archive },
    type: CHANGE_ARCHIVE_FILES_BEFORE_ENCRYPT,
  };
}

export function changeEncryptOutfolder(outfolder: string) {
  return {
    payload: { outfolder },
    type: CHANGE_ENCRYPT_OUTFOLDER,
  };
}

export function addRecipientCertificate(certId: number) {
  return {
    generateId: true,
    payload: { certId },
    type: ADD_RECIPIENT_CERTIFICATE,
  };
}

export function deleteRecipient(recipient: number) {
  return {
    payload: { recipient },
    type: DELETE_RECIPIENT_CERTIFICATE,
  };
}

export function changeLocale(locale: string) {
  return {
    payload: { locale },
    type: CHANGE_LOCALE,
  };
}
