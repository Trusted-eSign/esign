import * as fs from "fs";
import * as path from "path";
import { push } from "react-router-redux";
import {
  ACTIVE_CONTAINER, ACTIVE_FILE, ADD_RECIPIENT_CERTIFICATE,
  CHANGE_ARCHIVE_FILES_BEFORE_ENCRYPT,
  CHANGE_DELETE_FILES_AFTER_ENCRYPT, CHANGE_ECRYPT_ENCODING,
  CHANGE_ENCRYPT_OUTFOLDER, CHANGE_LOCALE,
  CHANGE_SIGNATURE_DETACHED, CHANGE_SIGNATURE_ENCODING, CHANGE_SIGNATURE_OUTFOLDER,
  CHANGE_SIGNATURE_TIMESTAMP, DELETE_FILE,
  DELETE_RECIPIENT_CERTIFICATE, FAIL,
  GET_CERTIFICATE_FROM_CONTAINER, LICENSE_PATH, LOAD_ALL_CERTIFICATES, LOAD_ALL_CONTAINERS,
  LOAD_LICENSE, PACKAGE_DELETE_FILE, PACKAGE_SELECT_FILE, PACKAGE_SIGN,
  REMOVE_ALL_CERTIFICATES, REMOVE_ALL_CONTAINERS, REMOVE_ALL_FILES,
  REMOVE_ALL_REMOTE_FILES, SELECT_FILE,
  SELECT_SIGNER_CERTIFICATE, SELECT_TEMP_CONTENT_OF_SIGNED_FILES, START,
  SUCCESS, TOGGLE_SAVE_TO_DOCUMENTS,
  VERIFY_CERTIFICATE, VERIFY_SIGNATURE,
} from "../constants";
import { connectedSelector } from "../selectors";
import { ERROR, SIGNED, UPLOADED, VERIFIED } from "../server/constants";
import * as signs from "../trusted/sign";
import { Store } from "../trusted/store";
import { extFile, fileExists, toBase64 } from "../utils";

export function changeLocation(location: string) {
  return (dispatch: (action: {}) => void) => {
    dispatch(push(location));
  };
}

export function loadLicense() {
  return (dispatch: (action: {}) => void) => {
    dispatch({ type: LOAD_LICENSE + START });

    setTimeout(() => {
      let data = "";
      let licenseStatus = 1;
      let parsedLicense;
      let buffer;
      let lic;
      let lic_format = "NONE"; // Type license: MTX - old license, JWT - license of jwt roken, TRIAL - триальная лицензия, NONE - license epsent
      let lic_error = 911; // CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE
      // Шаблон информации о лицензии для заполнения
      lic = {
        aud: "-",
        core: 65535,
        desc: "CryptoARM GOST",
        exp: 0,
        iat: 0,
        iss: 'ООО "Цифровые технологии"',
        jti: "",
        sub: "CryptoARM GOST",
      };
      if (fs.existsSync(LICENSE_PATH)) {
        data = fs.readFileSync(LICENSE_PATH, "utf8");
      }
      if (data && data.length) {
        // Проверка на наличие основной лицензии старого формата
        const result = data.match(/[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}-[A-Za-z0-9]{5}/ig);
        if (result != null) {
          lic_format = "MTX";
          const expirationTime = trusted.utils.Jwt.getExpirationTime(data);
          if (expirationTime === 0) { // лицензия корректна
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = 1;
            const loaded = true;
            lic_error = 900; // CTLICENSE_R_NO_ERROR
            dispatch({ payload: { data, lic, lic_format, loaded, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
          } else if (expirationTime > 900 && expirationTime <= 912) { // Возвратился код ошибки
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = 0;
            lic_error = expirationTime;
            const verified = true;
            dispatch({ payload: { data, lic_format, licenseStatus, lic_error, verified }, type: LOAD_LICENSE + FAIL });
          } else {
            lic.exp = expirationTime;
            lic.iat = 0;
            licenseStatus = 1;
            const loaded = true;
            lic_error = 900; // CTLICENSE_R_NO_ERROR
            dispatch({ payload: { data, lic, lic_format, loaded, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
          }
        } else {
          const result = data.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=\s\n\t]+$/);
          if (result != null) {
            lic_format = "JWT";
            const check = trusted.utils.Jwt.checkLicense(data);
            if (check === 0) {
              licenseStatus = 1;
            } else {
              lic_error = check;
              licenseStatus = 0;
            }
            const splitLicense = data.split(".");
            if (splitLicense[1]) {
              try {
                buffer = new Buffer(toBase64(splitLicense[1]), "base64").toString("utf8");
                parsedLicense = JSON.parse(buffer);
                if (parsedLicense.exp && parsedLicense.aud && parsedLicense.iat && parsedLicense.iss
                  && parsedLicense.jti && parsedLicense.sub) {
                  lic = parsedLicense;
                }
                const loaded = true;
                if (check === 0) {
                  lic_error = 900; // CTLICENSE_R_NO_ERROR
                }

                dispatch({ payload: { data, lic, lic_format, loaded, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
              } catch (e) {
                lic_format = "NONE"; // Лицензия отсутствует
                licenseStatus = 0; // Статуст лицензии: 0 - не действует
                data = "";
                const loaded = false;
                const verified = true;
                dispatch({ payload: { data, lic_format, licenseStatus, lic_error, loaded, verified }, type: LOAD_LICENSE + FAIL });
              }
            }
          } else {
            // Проверка на наличие и истечение временной лицензии
            const status_trial = trusted.utils.Jwt.checkTrialLicense(); // 1-лицензия действует, 0 - нет
            if (status_trial === 1) {
              lic_format = "TRIAL"; // Работает триальная лицензия
              const expirationTimeTrial = trusted.utils.Jwt.getTrialExpirationTime();
              lic.exp = expirationTimeTrial;
              lic.iat = expirationTimeTrial - 14 * 86400;
              data = "";
              const loaded = true;
              licenseStatus = 1; // Статуст лицензии: 1 - действует
              lic_error = 900; // CTLICENSE_R_NO_ERROR
              dispatch({ payload: { data, lic, lic_format, loaded, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
            } else {
              lic_format = "NONE"; // Лицензия отсутствует, т.к. триальная истекла
              licenseStatus = 0; // Статуст лицензии: 0 - не действует
              data = "";
              const loaded = false;
              const lic_error = 911; // CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE
              const verified = true;
              dispatch({ payload: { data, lic_format, licenseStatus, lic_error, loaded, verified }, type: LOAD_LICENSE + FAIL });
            }
          }
        }
      } else {
        // // Проверка на наличие и истечение временной лицензии
        const status_trial = trusted.utils.Jwt.checkTrialLicense(); // 1-лицензия действует, 0 - нет
        if (status_trial === 1) {
          lic_format = "TRIAL"; // Работает триальная лицензия
          const expirationTimeTrial = trusted.utils.Jwt.getTrialExpirationTime();
          lic.exp = expirationTimeTrial;
          lic.iat = expirationTimeTrial - 14 * 86400;
          data = "";
          const loaded = true;
          licenseStatus = 1; // Статуст лицензии: 1 - действует
          lic_error = 900; // CTLICENSE_R_NO_ERROR
          dispatch({ payload: { data, lic, lic_format, loaded, licenseStatus, lic_error }, type: LOAD_LICENSE + SUCCESS });
        } else {
          lic_format = "NONE"; // Лицензия отсутствует, т.к. триальная истекла
          licenseStatus = 0; // Статуст лицензии: 0 - не действует
          data = "";
          const loaded = false;
          const verified = true;
          const lic_error = 911; // CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE
          dispatch({ payload: { data, lic_format, licenseStatus, lic_error, loaded, verified }, type: LOAD_LICENSE + FAIL });
        }
      }
    }, 0);
  };
}

interface IFile {
  id: number;
  filename: string;
  lastModifiedDate: Date;
  fullpath: string;
  extension: string | undefined;
  active: boolean;
  extra: any;
  remoteId?: string;
  socket?: string;
}

interface IFilePath {
  fullpath: string;
  extra?: any;
  remoteId?: string;
  socket?: string;
}

interface INormalizedSignInfo {
  subjectFriendlyName: string;
  issuerFriendlyName: string;
  notBefore: number;
  notAfter: number;
  digestAlgorithm: string;
  signingTime: number | undefined;
  subjectName: string;
  issuerName: string;
}

export function packageSign(
  files: IFile[],
  cert: trusted.pki.Certificate,
  key: trusted.pki.Key,
  policies: string[],
  format: trusted.DataFormat,
  folderOut: string,
) {
  return (dispatch: (action: {}) => void, getState: () => any) => {
    dispatch({
      type: PACKAGE_SIGN + START,
    });

    let packageSignResult = true;

    setTimeout(() => {
      const signedFilePackage: IFilePath[] = [];
      const signedFileIdPackage: number[] = [];
      const state = getState();
      const { connections, remoteFiles } = state;

      files.forEach((file) => {
        const newPath = signs.signFile(file.fullpath, cert, key, policies, format, folderOut);
        if (newPath) {
          signedFileIdPackage.push(file.id);
          if (!file.socket) {
            signedFilePackage.push({ fullpath: newPath });
          }

          if (file.socket) {
            const connection = connections.getIn(["entities", file.socket]);
            const connectedList = connectedSelector(state, { connected: true });

            if (connection && connection.connected && connection.socket) {
              connection.socket.emit(SIGNED, { id: file.remoteId });
            } else if (connectedList.length) {
              const connectedSocket = connectedList[0].socket;

              connectedSocket.emit(SIGNED, { id: file.remoteId });
              connectedSocket.broadcast.emit(SIGNED, { id: file.remoteId });
            }

            fs.unlinkSync(file.fullpath);

            if (remoteFiles.uploader) {
              let cms = signs.loadSign(newPath);

              if (cms.isDetached()) {
                // tslint:disable-next-line:no-conditional-assignment
                if (!(cms = signs.setDetachedContent(cms, newPath))) {
                  throw new Error(("err"));
                }
              }

              const signatureInfo = signs.getSignPropertys(cms);

              const normalyzeSignatureInfo: INormalizedSignInfo[] = [];

              signatureInfo.forEach((info: any) => {
                const subjectCert = info.certs[info.certs.length - 1];

                normalyzeSignatureInfo.push({
                  digestAlgorithm: subjectCert.signatureDigestAlgorithm,
                  issuerFriendlyName: subjectCert.issuerFriendlyName,
                  issuerName: subjectCert.issuerName,
                  notAfter: new Date(subjectCert.notAfter).getTime(),
                  notBefore: new Date(subjectCert.notBefore).getTime(),
                  signingTime: info.signingTime ? new Date(info.signingTime).getTime() : undefined,
                  subjectFriendlyName: info.subject,
                  subjectName: subjectCert.subjectName,

                });
              });

              window.request.post({
                formData: {
                  extra: JSON.stringify(file.extra),
                  file: fs.createReadStream(newPath),
                  id: file.remoteId,
                  signers: JSON.stringify(normalyzeSignatureInfo),
                },
                url: remoteFiles.uploader,
              }, (err: Error) => {
                if (err) {
                  if (connection && connection.connected && connection.socket) {
                    connection.socket.emit(ERROR, { id: file.remoteId, error: err });
                  } else if (connectedList.length) {
                    const connectedSocket = connectedList[0].socket;

                    connectedSocket.emit(ERROR, { id: file.remoteId, error: err });
                    connectedSocket.broadcast.emit(ERROR, { id: file.remoteId, error: err });
                  }
                } else {
                  if (connection && connection.connected && connection.socket) {
                    connection.socket.emit(UPLOADED, { id: file.remoteId });
                  } else if (connectedList.length) {
                    const connectedSocket = connectedList[0].socket;

                    connectedSocket.emit(UPLOADED, { id: file.remoteId });
                    connectedSocket.broadcast.emit(UPLOADED, { id: file.remoteId });
                  }

                  dispatch({
                    payload: { id: file.id },
                    type: DELETE_FILE,
                  });
                }
              },
              );
            }
          }

        } else {
          packageSignResult = false;
        }
      });

      dispatch({
        payload: { packageSignResult },
        type: PACKAGE_SIGN + SUCCESS,
      });

      dispatch(filePackageSelect(signedFilePackage));
      dispatch(filePackageDelete(signedFileIdPackage));
    }, 0);
  };
}

export function filePackageSelect(files: IFilePath[]) {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: PACKAGE_SELECT_FILE + START,
    });

    setTimeout(() => {
      const filePackage: IFile[] = [];

      files.forEach((file: IFilePath) => {
        const { fullpath, extra, remoteId, socket } = file;
        const stat = fs.statSync(fullpath);
        const extension = extFile(fullpath);

        const fileProps = {
          active: true,
          extension,
          extra,
          filename: path.basename(fullpath),
          fullpath,
          id: Date.now() + Math.random(),
          lastModifiedDate: stat.birthtime,
          remoteId,
          size: stat.size,
          socket,
        };

        filePackage.push(fileProps);
      });

      dispatch({
        payload: { filePackage },
        type: PACKAGE_SELECT_FILE + SUCCESS,
      });
    }, 0);
  };
}

export function filePackageDelete(filePackage: number[]) {
  return {
    payload: { filePackage },
    type: PACKAGE_DELETE_FILE,
  };
}

export function removeAllFiles() {
  return {
    type: REMOVE_ALL_FILES,
  };
}

export function removeAllRemoteFiles() {
  return {
    type: REMOVE_ALL_REMOTE_FILES,
  };
}

export function selectTempContentOfSignedFiles(tempContentOfSignedFiles: string) {
  return {
    payload: { tempContentOfSignedFiles },
    type: SELECT_TEMP_CONTENT_OF_SIGNED_FILES,
  };
}

export function loadAllCertificates() {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: LOAD_ALL_CERTIFICATES + START,
    });

    setTimeout(() => {
      const certificateStore = new Store();

      window.PKISTORE = certificateStore;
      window.TRUSTEDCERTIFICATECOLLECTION = certificateStore.trustedCerts;
      window.PKIITEMS = certificateStore.items;

      const crls = [];
      const certs = [];

      for (const item of certificateStore.items) {
        if (item.type === "CERTIFICATE") {
          if (!item.id) {
            item.id = item.provider + "_" + item.category + "_" + item.hash;
          }

          certs.push(item);
        } else if (item.type === "CRL") {
          if (!item.id) {
            item.id = item.provider + "_" + item.category + "_" + item.hash;
          }

          crls.push(item);
        }
      }

      dispatch({
        certs,
        crls,
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

export function verifyCertificate(certificateId: string) {
  return (dispatch: (action: {}) => void, getState: () => any) => {
    const { certificates } = getState();

    const certItem = certificates.getIn(["entities", certificateId]);
    const certificate = window.PKISTORE.getPkiObject(certItem);
    let certificateStatus = false;

    try {
      if (certItem.provider === "SYSTEM") {
        const chain = new trusted.pki.Chain();
        const chainForVerify = chain.buildChain(certificate, window.TRUSTEDCERTIFICATECOLLECTION);
        certificateStatus = chain.verifyChain(chainForVerify, null);
      } else {
        certificateStatus = trusted.utils.Csp.verifyCertificateChain(certificate);
      }
    } catch (e) {
      certificateStatus = false;
    }

    dispatch({
      payload: { certificateId, certificateStatus },
      type: VERIFY_CERTIFICATE,
    });
  };
}

export function selectSignerCertificate(selected: string) {
  return {
    payload: { selected },
    type: SELECT_SIGNER_CERTIFICATE,
  };
}

export function loadAllContainers() {
  return (dispatch: (action: {}) => void) => {
    dispatch({
      type: LOAD_ALL_CONTAINERS + START,
    });

    setTimeout(() => {
      let enumedContainers: any[] = [];

      try {
        enumedContainers = trusted.utils.Csp.enumContainers(75);
      } catch (e) {
        dispatch({
          type: LOAD_ALL_CONTAINERS + FAIL,
        });
      }

      const filteredContainers = [];

      for (const cont of enumedContainers) {
        filteredContainers.push({
          friendlyName: cont.container,
          id: Math.random(),
          name: cont.unique,
          reader: cont.fqcnA.substring(4, cont.fqcnA.lastIndexOf("\\")),
        });
      }

      dispatch({
        containers: filteredContainers,
        type: LOAD_ALL_CONTAINERS + SUCCESS,
      });
    }, 0);
  };
}

export function removeAllContainers() {
  return {
    type: REMOVE_ALL_CONTAINERS,
  };
}

export function getCertificateFromContainer(container: number) {
  return (dispatch: (action: {}) => void, getState: () => any) => {
    dispatch({
      payload: { container },
      type: GET_CERTIFICATE_FROM_CONTAINER + START,
    });

    setTimeout(() => {
      const { containers } = getState();
      const cont = containers.getIn(["entities", container]);
      const certificate = trusted.utils.Csp.getCertificateFromContainer(cont.name, 75);
      const certificateItem = {
        hash: certificate.thumbprint,
        issuerFriendlyName: certificate.issuerFriendlyName,
        key: "1",
        notAfter: certificate.notAfter,
        organizationName: certificate.organizationName,
        publicKeyAlgorithm: certificate.publicKeyAlgorithm,
        serial: certificate.serialNumber,
        signatureAlgorithm: certificate.signatureAlgorithm,
        signatureDigestAlgorithm: certificate.signatureDigestAlgorithm,
        subjectFriendlyName: certificate.subjectFriendlyName,
        subjectName: null,
      };

      dispatch({
        payload: { container, certificate, certificateItem },
        type: GET_CERTIFICATE_FROM_CONTAINER + SUCCESS,
      });
    }, 0);
  };
}

export function activeContainer(container: number) {
  return {
    payload: { container },
    type: ACTIVE_CONTAINER,
  };
}

export function selectFile(fullpath: string, name?: string, lastModifiedDate?: Date, size?: number, remoteId?: string, socket?: string) {
  let stat;

  if (!fileExists(fullpath)) {
    return {
      type: SELECT_FILE + FAIL,
    };
  }

  if (!lastModifiedDate || !size) {
    stat = fs.statSync(fullpath);
  }

  const extension = extFile(fullpath);
  const file = {
    extension,
    filename: name ? name : path.basename(fullpath),
    fullpath,
    lastModifiedDate: lastModifiedDate ? lastModifiedDate : (stat ? stat.birthtime : undefined),
    remoteId,
    size: size ? size : (stat ? stat.size : undefined),
    socket,
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

export function deleteFile(fileId: number) {
  return {
    payload: { fileId },
    type: DELETE_FILE,
  };
}

export function verifySignature(fileId: string) {
  return (dispatch: (action: {}) => void, getState: () => any) => {
    const state = getState();
    const { connections, documents, files } = state;
    let signaruteStatus = false;
    let signatureInfo;
    let cms: trusted.cms.SignedData;
    let file = files.getIn(["entities", fileId]);

    if (!file) {
      file = documents.getIn(["entities", fileId]);
    }

    try {
      cms = signs.loadSign(file.fullpath);

      if (cms.isDetached()) {
        // tslint:disable-next-line:no-conditional-assignment
        if (!(cms = signs.setDetachedContent(cms, file.fullpath))) {
          throw new Error(("err"));
        }
      }

      signaruteStatus = signs.verifySign(cms);
      signatureInfo = signs.getSignPropertys(cms);

      if (file.socket) {
        const connectedList = connectedSelector(state, { connected: true });
        const connection = connections.getIn(["entities", file.socket]);

        if (connection && connection.connected && connection.socket) {
          connection.socket.emit(VERIFIED, signatureInfo);
        } else if (connectedList.length) {
          const connectedSocket = connectedList[0].socket;

          connectedSocket.emit(VERIFIED, signatureInfo);
          connectedSocket.broadcast.emit(VERIFIED, signatureInfo);
        }
      }

      signatureInfo = signatureInfo.map((info: any) => {
        return {
          fileId,
          ...info,
          id: Math.random(),
        };
      });

    } catch (error) {
      dispatch({
        payload: { error, fileId },
        type: VERIFY_SIGNATURE + FAIL,
      });
    }

    if (signatureInfo) {
      dispatch({
        generateId: true,
        payload: { fileId, signaruteStatus, signatureInfo },
        type: VERIFY_SIGNATURE + SUCCESS,
      });
    }
  };
}

export function changeSignatureEncoding(encoding: string) {
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

export function toggleSaveToDocuments(saveToDocuments: boolean) {
  return {
    payload: { saveToDocuments },
    type: TOGGLE_SAVE_TO_DOCUMENTS,
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
