import * as fs from "fs";
import * as path from "path";
import { USER_NAME } from "../constants";
import localize from "../i18n/localize";
import { fileCoding, fileExists } from "../utils";
import logger from "../winstonLogger";

const dialog = window.electron.remote.dialog;

export function loadSign(uri: string): trusted.cms.SignedData {
  try {
    let format: trusted.DataFormat;
    let cms: trusted.cms.SignedData;

    format = fileCoding(uri);
    cms = new trusted.cms.SignedData();
    cms.policies = ["noSignerCertificateVerify"];
    cms.load(uri, format);

    return cms;
  } catch (e) {
    $(".toast-load_sign_failed").remove();
    Materialize.toast(localize("Sign.load_sign_failed", window.locale), 2000, "toast-load_sign_failed");

    return undefined;
  }
}

export function setDetachedContent(cms: trusted.cms.SignedData, uri: string): trusted.cms.SignedData {
  try {
    if (cms.isDetached()) {
      let tempURI: string;
      tempURI = uri.substring(0, uri.lastIndexOf("."));
      if (!fileExists(tempURI)) {
        tempURI = dialog.showOpenDialog(null, { title: localize("Sign.sign_content_file", window.locale) + path.basename(uri), properties: ["openFile"] });

        if (tempURI) {
          tempURI = tempURI[0];
        }

        if (!tempURI || !fileExists(tempURI)) {
          $(".toast-verify_get_content_failed").remove();
          Materialize.toast(localize("Sign.verify_get_content_failed", window.locale), 2000, "toast-verify_get_content_failed");

          return undefined;
        }
      }

      cms.content = {
        type: trusted.cms.SignedDataContentType.url,
        data: tempURI,
      };
    }

    return cms;
  } catch (e) {
    $(".toast-set_content_failed").remove();
    Materialize.toast(localize("Sign.set_content_failed", window.locale), 2000, "toast-set_content_failed");

    return undefined;
  }
}

export function signFile(uri: string, cert: trusted.pki.Certificate, key: trusted.pki.Key, policies: any, format: trusted.DataFormat, folderOut: string) {
  let outURI: string;

  if (folderOut.length > 0) {
    outURI = path.join(folderOut, path.basename(uri) + ".sig");
  } else {
    outURI = uri + ".sig";
  }

  let indexFile: number = 1;
  let newOutUri: string = outURI;
  const fileUri = outURI.substring(0, outURI.lastIndexOf("."));

  while (fileExists(newOutUri)) {
    const parsed = path.parse(fileUri);
    newOutUri = path.join(parsed.dir, parsed.name + "_(" + indexFile + ")" + parsed.ext + ".sig");
    indexFile++;
  }

  outURI = newOutUri;

  try {
    const sd: trusted.cms.SignedData = new trusted.cms.SignedData();
    sd.policies = policies;
    sd.createSigner(cert, key);
    sd.content = {
      type: trusted.cms.SignedDataContentType.url,
      data: uri,
    };
    sd.sign();
    sd.save(outURI, format);

    sd.freeContent();
  } catch (err) {
    logger.log({
      certificate: cert.subjectName,
      level: "error",
      message: err.message ? err.message : err,
      operation: localize("Events.sign", window.locale),
      operationObject: {
        in: path.basename(uri),
        out: "Null",
      },
      userName: USER_NAME,
    });

    return "";
  }

  logger.log({
    certificate: cert.subjectName,
    level: "info",
    message: "",
    operation: localize("Events.sign", window.locale),
    operationObject: {
      in: path.basename(uri),
      out: path.basename(outURI),
    },
    userName: USER_NAME,
  });

  return outURI;
}

export function resignFile(uri: string, cert: trusted.pki.Certificate, key: trusted.pki.Key, policies: any, format: trusted.DataFormat, folderOut: string) {
  let outURI: string;

  if (folderOut.length > 0) {
    outURI = path.join(folderOut, path.basename(uri));
  } else {
    outURI = uri;
  }

  try {
    let sd: trusted.cms.SignedData = loadSign(uri);

    const certs: trusted.pki.CertificateCollection = sd.certificates();
    let tempCert: trusted.pki.Certificate;
    for (let i = 0; i < certs.length; i++) {
      tempCert = certs.items(i);
      if (tempCert.equals(cert)) {
        policies.push("noCertificates");
        break;
      }
    }

    if (sd.isDetached()) {
      policies.push("detached");

      if (!(sd = setDetachedContent(sd, uri))) {
        return;
      }

      sd.policies = ["noSignerCertificateVerify"];

      if (!(verifySign(sd))) {
        return;
      }
    }

    sd.policies = policies;
    sd.createSigner(cert, key);
    sd.sign();
    sd.save(outURI, format);
  } catch (err) {
    logger.log({
      certificate: cert.subjectName,
      level: "error",
      message: err.message ? err.message : err,
      operation: localize("Events.sign", window.locale),
      operationObject: {
        in: path.basename(uri),
        out: "Null",
      },
      userName: USER_NAME,
    });

    return "";
  }

  logger.log({
    certificate: cert.subjectName,
    level: "info",
    message: localize("Events.add_sign", window.locale),
    operation: localize("Events.sign", window.locale),
    operationObject: {
      in: path.basename(uri),
      out: path.basename(outURI),
    },
    userName: USER_NAME,
  });

  return outURI;
}

export function unSign(uri: string, folderOut: string, logOperation = true): any {
  let outURI: string;
  let content: trusted.cms.ISignedDataContent;

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
    let cms: trusted.cms.SignedData = loadSign(uri);

    if (!cms.isDetached()) {
      content = cms.content;
      try {
        fs.writeFileSync(outURI, content.data);

        logger.log({
          level: "info",
          message: "",
          operation: localize("Events.remove_sign", window.locale),
          operationObject: {
            in: path.basename(uri),
            out: path.basename(outURI),
          },
          userName: USER_NAME,
        });
      } catch (err) {
        logger.log({
          certificate: "",
          level: "error",
          message: err.message ? err.message : err,
          operation: localize("Events.remove_sign", window.locale),
          operationObject: {
            in: path.basename(uri),
            out: "Null",
          },
          userName: USER_NAME,
        });

        return "";
      }
    } else {
      $(".toast-files_unsigned_detached").remove();
      Materialize.toast(localize("Sign.files_unsigned_detached", window.locale), 2000, "toast-files_unsigned_detached");
      return "";
    }
  } catch (err) {
    logger.log({
      certificate: "",
      level: "error",
      message: err.message ? err.message : err,
      operation: localize("Events.remove_sign", window.locale),
      operationObject: {
        in: path.basename(uri),
        out: "Null",
      },
      userName: USER_NAME,
    });

    return "";
  }

  return outURI;
}

/**
 * @param  {string} uri
 */
export function verifySign(cms: trusted.cms.SignedData): boolean {
  let res: boolean = false;

  try {
    let signers: trusted.cms.SignerCollection;
    let signerCert: trusted.pki.Certificate = undefined;
    let signer: trusted.cms.Signer;
    let signerId: trusted.cms.SignerId;
    let signerCertItems: trusted.pkistore.PkiItem[];
    let certs: trusted.pki.CertificateCollection = new trusted.pki.CertificateCollection();

    signers = cms.signers();
    certs = cms.certificates();

    for (let i = 0; i < signers.length; i++) {
      signer = signers.items(i);
      signerId = signer.signerId;
      signerCertItems = window.PKISTORE.find({
        issuerName: signerId.issuerName,
        serial: signerId.serialNumber,
      });
      for (let j = 0; j < signerCertItems.length; j++) {
        signerCert = window.PKISTORE.getPkiObject(signerCertItems[j]);
        if (signerCert) {
          certs.push(signerCert);
          break;
        }
      }
    }

    res = cms.verify(certs);
    return res;
  } catch (e) {
    $(".toast-verify_sign_failed").remove();
    Materialize.toast(localize("Sign.verify_sign_failed", window.locale), 2000, "toast-verify_sign_failed");
    return res;
  }
}

export function verifySignerCert(cert: trusted.pki.Certificate): boolean {
  try {
    return trusted.utils.Csp.verifyCertificateChain(cert);
  } catch (e) {
    return false;
  }
}

export function getSignPropertys(cms: trusted.cms.SignedData) {
  try {
    let signers: trusted.cms.SignerCollection;
    let signerCert: trusted.pki.Certificate;
    let signer: trusted.cms.Signer;
    let signerId: trusted.cms.SignerId;
    let signerCertItems: trusted.pkistore.PkiItem[];
    let certificates: trusted.pki.CertificateCollection;
    let ch: trusted.pki.CertificateCollection;
    let chain: trusted.pki.Chain;
    let cert: trusted.pki.Certificate;
    let certificatesSignStatus: boolean;
    let certSignStatus: boolean;
    let signerStatus: boolean = false;
    let result: any = [];
    let certSign: any = [];

    chain = new trusted.pki.Chain();

    signers = cms.signers();
    certificates = cms.certificates();

    for (let i = 0; i < signers.length; i++) {
      signer = signers.items(i);
      signerId = signer.signerId;

      for (let j = 0; j < certificates.length; j++) {
        let tmpCert: trusted.pki.Certificate = certificates.items(j);
        if ((tmpCert.issuerName === signerId.issuerName) && (tmpCert.serialNumber === signerId.serialNumber)) {
          signer.certificate = tmpCert;
          break;
        }
      }

      if (!signer.certificate) {
        signerCertItems = window.PKISTORE.find({
          issuerName: signerId.issuerName,
          serial: signerId.serialNumber,
        });
        for (let j = 0; j < signerCertItems.length; j++) {
          signerCert = window.PKISTORE.getPkiObject(signerCertItems[j]);
          if (signerCert) {
            signer.certificate = signerCert;
            break;
          }
        }
      }

      if (!signer.certificate) {
        $(".toast-signercert_not_found").remove();
        Materialize.toast(localize("Sign.signercert_not_found", window.locale), 2000, "toast-signercert_not_found");
      }
    }

    let curRes: any;
    for (let i: number = 0; i < signers.length; i++) {
      certificatesSignStatus = true;
      signer = signers.items(i);
      cert = signer.certificate;

      try {
        ch = trusted.utils.Csp.buildChain(cert);
      } catch (e) {
        ch = undefined;
      }

      curRes = {
        alg: undefined,
        certs: undefined,
        digestAlgorithm: undefined,
        status_verify: undefined,
        subject: undefined,
      }

      if (!ch || !ch.length || ch.length === 0) {
        certificatesSignStatus = false;
        $(".toast-build_chain_failed").remove();
        Materialize.toast(localize("Sign.build_chain_failed", window.locale), 2000, "toast-build_chain_failed");
        certSign.push({
          active: false,
          serial: cert.serialNumber,
          subjectFriendlyName: cert.subjectFriendlyName,
          subjectName: cert.subjectName,
          organizationName: cert.organizationName,
          issuerFriendlyName: cert.issuerFriendlyName,
          issuerName: cert.issuerName,
          notBefore: cert.notBefore,
          notAfter: cert.notAfter,
          signatureAlgorithm: cert.signatureAlgorithm,
          signatureDigestAlgorithm: cert.signatureDigestAlgorithm,
          publicKeyAlgorithm: cert.publicKeyAlgorithm,
          hash: cert.thumbprint,
          key: false,
          object: cert,
        });
      } else {
        for (let j: number = ch.length - 1; j >= 0; j--) {
          const it: trusted.pki.Certificate = ch.items(j);
          certSignStatus = verifySignerCert(it);
          if (!(certSignStatus)) {
            certificatesSignStatus = false;
          }
          certSign.push({
            active: false,
            serial: it.serialNumber,
            subjectFriendlyName: it.subjectFriendlyName,
            subjectName: it.subjectName,
            organizationName: it.organizationName,
            issuerFriendlyName: it.issuerFriendlyName,
            issuerName: it.issuerName,
            notAfter: it.notAfter,
            notBefore: it.notBefore,
            signatureAlgorithm: it.signatureAlgorithm,
            signatureDigestAlgorithm: it.signatureDigestAlgorithm,
            publicKeyAlgorithm: it.publicKeyAlgorithm,
            hash: it.thumbprint,
            key: false,
            status: certSignStatus,
            object: cert,
          });
        }
      }

      curRes = {
        alg: cert.signatureAlgorithm,
        certs: certSign,
        digestAlgorithm: cert.signatureDigestAlgorithm,
        signingTime: signer.signingTime,
        status_verify: false,
        subject: cert.subjectFriendlyName,
      };
      certSign = [];

      try {
        signerStatus = signer.signedAttributes().length > 0 ? signer.verify() && signer.verifyContent(cms.content) : signer.verifyContent(cms.content);
      } catch (e) {
        $(".toast-verify_signercontent_founds_errors").remove();
        Materialize.toast(localize("Sign.verify_signercontent_founds_errors", window.locale), 2000, "toast-verify_signercontent_founds_errors");
      }

      curRes.status_verify = certificatesSignStatus && signerStatus,

        result.push(curRes);
    }

    return result;
  } catch (e) {
    $(".toast-verify_signers_failed").remove();
    Materialize.toast(localize("Sign.verify_signers_failed", window.locale), 2000, "toast-verify_signers_failed");

    return undefined;
  }
}
