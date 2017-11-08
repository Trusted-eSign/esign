import * as fs from "fs";
import * as path from "path";
import { lang } from "../module/global_app";
import { fileExists, fileCoding } from "../utils";
import * as jwt from "./jwt";

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
        Materialize.toast(lang.get_resource.Sign.load_sign_failed, 2000, "toast-load_sign_failed");

        return undefined;
    }
}

export function setDetachedContent(cms: trusted.cms.SignedData, uri: string): trusted.cms.SignedData {
    try {
        if (cms.isDetached()) {
            let tempURI: string;
            tempURI = uri.substring(0, uri.lastIndexOf("."));
            if (!fileExists(tempURI)) {
                tempURI = dialog.showOpenDialog(null, { title: lang.get_resource.Sign.sign_content_file + path.basename(uri), properties: ["openFile"] });

                if (tempURI) {
                    tempURI = tempURI[0];
                }

                if (!tempURI || !fileExists(tempURI)) {
                    $(".toast-verify_get_content_failed").remove();
                    Materialize.toast(lang.get_resource.Sign.verify_get_content_failed, 2000, "toast-verify_get_content_failed");
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
        Materialize.toast(lang.get_resource.Sign.set_content_failed, 2000, "toast-set_content_failed");

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
    while (fileExists(newOutUri)) {
        newOutUri = path.join(path.parse(outURI).dir, "(" + indexFile + ")" + path.basename(outURI));
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
    } catch (err) {
      //  let jwtRes: number = jwt.checkLicense();
      //  if (jwtRes) {
      //      $(".toast-jwt_error").remove();
      //      Materialize.toast(jwt.getErrorMessage(jwtRes), 4000, "toast-jwt_error");
       // }

        return "";
    }

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
      // let jwtRes: number = jwt.checkLicense();
      //  if (jwtRes) {
      //      $(".toast-jwt_error").remove();
      //      Materialize.toast(jwt.getErrorMessage(jwtRes), 4000, "toast-jwt_error");
      //  }

        return "";
    }

    return outURI;
}

export function unSign(uri: string, folderOut: string): any {
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
        newOutUri = path.join(path.parse(outURI).dir, "(" + indexFile + ")" + path.basename(outURI));
        indexFile++;
    }

    outURI = newOutUri;

    try {
        let cms: trusted.cms.SignedData = loadSign(uri);

        if (!cms.isDetached()) {
            content = cms.content;
            try {
                fs.writeFileSync(outURI, content.data);
            } catch (err) {
                return "";
            }
        } else {
            $(".toast-files_unsigned_detached").remove();
            Materialize.toast(lang.get_resource.Sign.files_unsigned_detached, 2000, "toast-files_unsigned_detached");
            return "";
        }
    } catch (err) {
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
        Materialize.toast(lang.get_resource.Sign.verify_sign_failed, 2000, "toast-verify_sign_failed");
        return res;
    }
}

export function verifySignerCert(cert: trusted.pki.Certificate): boolean {
    let chain: trusted.pki.Chain;
    let certs: trusted.pki.CertificateCollection;
    let chainForVerify: trusted.pki.CertificateCollection;

    chain = new trusted.pki.Chain();

    certs = window.TRUSTEDCERTIFICATECOLLECTION;

    try {
        chainForVerify = chain.buildChain(cert, certs);
        return chain.verifyChain(chainForVerify, null);
    } catch (e) {
        return undefined;
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
        let certsTmp: trusted.pki.CertificateCollection = window.TRUSTEDCERTIFICATECOLLECTION;
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
                Materialize.toast(lang.get_resource.Sign.signercert_not_found, 2000, "toast-signercert_not_found");
            }
        }

        let curRes: any;
        for (let i: number = 0; i < signers.length; i++) {
            certificatesSignStatus = true;
            signer = signers.items(i);
            cert = signer.certificate;

            try {
                ch = chain.buildChain(cert, certsTmp);
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
              Materialize.toast(lang.get_resource.Sign.build_chain_failed, 2000, "toast-build_chain_failed");
              certSign.push({
                active: false,
                serial: cert.serialNumber,
                subjectFriendlyName: cert.subjectFriendlyName,
                subjectName: cert.subjectName,
                organizationName: cert.organizationName,
                issuerFriendlyName: cert.issuerFriendlyName,
                issuerName: cert.issuerName,
                notAfter: cert.notAfter,
                signatureAlgorithm: cert.signatureAlgorithm,
                hash: cert.thumbprint,
                key: false,
                object: cert,
              });
            } else {
              for (let j: number = ch.length - 1; j >= 0; j--) {
                let it: trusted.pki.Certificate = ch.items(j);
                if (!(certSignStatus = verifySignerCert(it))) {
                  certificatesSignStatus = false;
                }
                certSign.push({
                  active: false,
                  serial: it.serialNumber,
                  subjectFriendlyName: it.subjectFriendlyName,
                  organizationName: it.organizationName,
                  issuerFriendlyName: it.issuerFriendlyName,
                  notAfter: it.notAfter,
                  signatureAlgorithm: it.signatureAlgorithm,
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
                    digestAlgorithm: cert.signatureDigest,
                    status_verify: false,
                    subject: cert.subjectFriendlyName,
                };
            certSign = [];

            try {
                signerStatus = signer.signedAttributes().length > 0 ? signer.verify() && signer.verifyContent(cms.content) : signer.verifyContent(cms.content);
            } catch (e) {
                $(".toast-verify_signercontent_founds_errors").remove();
                Materialize.toast(lang.get_resource.Sign.verify_signercontent_founds_errors, 2000, "toast-verify_signercontent_founds_errors");
            }

            curRes.status_verify = certificatesSignStatus && signerStatus,

            result.push(curRes);
        }

        return result;
    } catch (e) {
        $(".toast-verify_signers_failed").remove();
        Materialize.toast(lang.get_resource.Sign.verify_signers_failed, 2000, "toast-verify_signers_failed");

        return undefined;
    }
}
