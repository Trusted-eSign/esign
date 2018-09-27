import * as fs from "fs";
import * as path from "path";
import { USER_NAME } from "../constants";
import localize from "../i18n/localize";
import { fileCoding, fileExists } from "../utils";
import logger from "../winstonLogger";

export function encryptFile(uri: string, certs: trusted.pkistore.PkiItem[], policies: any, format: trusted.DataFormat, folderOut: string): string {
  let cipher: trusted.pki.Cipher;
  let certsCollection: trusted.pki.CertificateCollection;
  let cert: trusted.pki.Certificate;
  let indexFile: number;
  let newOutUri: string;
  let outURI: string;

  if (folderOut.length > 0) {
    outURI = path.join(folderOut, path.basename(uri) + ".enc");
  } else {
    outURI = uri + ".enc";
  }

  indexFile = 1;
  newOutUri = outURI;
  const fileUri = outURI.substring(0, outURI.lastIndexOf("."));

  while (fileExists(newOutUri)) {
    const parsed = path.parse(fileUri);

    newOutUri = path.join(parsed.dir, parsed.name + "_(" + indexFile + ")" + parsed.ext + ".enc");
    indexFile++;
  }

  outURI = newOutUri;

  try {
    cipher = new trusted.pki.Cipher();
    certsCollection = new trusted.pki.CertificateCollection();

    certs.forEach(function(certItem: trusted.pkistore.PkiItem): void {
      cert = window.PKISTORE.getPkiObject(certItem);
      certsCollection.push(cert);
    });

    cipher.recipientsCerts = certsCollection;

    cipher.encrypt(uri, outURI, format);
  } catch (err) {
    logger.log({
      certificate: "",
      level: "error",
      message: err.message ? err.message : err,
      operation: "Шифрование",
      operationObject: {
        in: path.basename(uri),
        out: "Null",
      },
      userName: USER_NAME,
    });

    outURI = "";
  }

  if (policies.deleteFiles) {
    fs.unlinkSync(uri);
  }

  logger.log({
    certificate: "",
    level: "info",
    message: "",
    operation: "Шифрование",
    operationObject: {
      in: path.basename(uri),
      out: path.basename(outURI),
    },
    userName: USER_NAME,
  });

  return outURI;
}

export function decryptFile(uri: string, folderOut: string): string {
  let format: trusted.DataFormat;
  let cipher: trusted.pki.Cipher;
  let ris: trusted.cms.CmsRecipientInfoCollection;
  let ri: trusted.cms.CmsRecipientInfo;
  let certs: trusted.pkistore.PkiItem[];
  let item: trusted.pkistore.PkiItem;
  let certWithKey: trusted.pki.Certificate;
  let key: trusted.pki.Key;
  let outURI: string;

  if (folderOut.length > 0) {
    outURI = path.join(folderOut, path.basename(uri));
    outURI = outURI.substring(0, outURI.lastIndexOf("."));
  } else {
    outURI = uri.substring(0, uri.lastIndexOf("."));
  }

  let indexFile: number = 1;
  let newOutUri: string = outURI;
  while (fileExists(newOutUri)) {
    const parsed = path.parse(outURI);

    newOutUri = path.join(parsed.dir, parsed.name + "_(" + indexFile + ")" + parsed.ext);
    indexFile++;
  }

  outURI = newOutUri;

  try {
    format = fileCoding(uri);
    cipher = new trusted.pki.Cipher();
    ris = cipher.getRecipientInfos(uri, format);

    for (let i = 0; i < ris.length; i++) {
      ri = ris.items(i);

      certs = window.PKISTORE.find({
        issuerName: ri.issuerName,
        serial: ri.serialNumber,
      });

      for (let i = 0; i < certs.length; i++) {
        item = certs[i];
        if (key = window.PKISTORE.findKey(item)) {
          certWithKey = window.PKISTORE.getPkiObject(item);
          break;
        }
      }

      if (certWithKey) {
        break;
      }
    }

    if (!certWithKey) {
      $(".toast-search_decrypt_cert_failed").remove();
      Materialize.toast(localize("Encrypt.search_decrypt_cert_failed", window.locale), 2000, "toast-search_decrypt_cert_failed");

      throw new Error("No have certificate with key");
    }

    cipher.recipientCert = certWithKey;
    cipher.privKey = key;

    cipher.decrypt(uri, outURI, format);

    logger.log({
      certificate: "",
      level: "info",
      message: "",
      operation: "Расшифрование",
      operationObject: {
        in: path.basename(uri),
        out: path.basename(outURI),
      },
      userName: USER_NAME,
    });

    return outURI;
  } catch (err) {
    logger.log({
      certificate: "",
      level: "error",
      message: err.message ? err.message : err,
      operation: "Расшифрование",
      operationObject: {
        in: path.basename(uri),
        out: "Null",
      },
      userName: USER_NAME,
    });

    return "";
  }
}
