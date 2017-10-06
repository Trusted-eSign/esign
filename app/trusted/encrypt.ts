import { lang } from "../module/global_app";
import * as native from "../native";
import { utils } from "../utils";

export function encryptFile(uri: string, certs: Array<trusted.pkistore.PkiItem>, policies: any, format: trusted.DataFormat, folderOut: string): string {
    let cipher: trusted.pki.Cipher;
    let certsCollection: trusted.pki.CertificateCollection;
    let cert: trusted.pki.Certificate;
    let indexFile: number;
    let newOutUri: string;
    let outURI: string;

    if (folderOut.length > 0) {
        outURI = native.path.join(folderOut, native.path.basename(uri) + ".enc");
    } else {
        outURI = uri + ".enc";
    }

    indexFile = 1;
    newOutUri = outURI;
    while (utils.fileExists(newOutUri)) {
        newOutUri = native.path.join(native.path.parse(outURI).dir, "(" + indexFile + ")"
            + native.path.basename(outURI));
        indexFile++;
    }

    outURI = newOutUri;

    try {
        cipher = new trusted.pki.Cipher();
        certsCollection = new trusted.pki.CertificateCollection();

        certs.forEach(function (certItem: trusted.pkistore.PkiItem): void {
            cert = window.PKISTORE.getPkiObject(certItem);
            certsCollection.push(cert);
        });

        cipher.recipientsCerts = certsCollection;

        cipher.encrypt(uri, outURI, format);
    } catch (e) {
        outURI = "";
    }

    if (policies.deleteFiles) {
        native.fs.unlinkSync(uri);
    }

    return outURI;
}

export function decryptFile(uri: string, folderOut: string): string {
    let format: trusted.DataFormat;
    let cipher: trusted.pki.Cipher;
    let ris: trusted.cms.CmsRecipientInfoCollection;
    let ri: trusted.cms.CmsRecipientInfo;
    let certs: Array<trusted.pkistore.PkiItem>;
    let item: trusted.pkistore.PkiItem;
    let certWithKey: trusted.pki.Certificate;
    let key: trusted.pki.Key;
    let outURI: string = uri.substring(0, uri.lastIndexOf("."));

    let indexFile: number = 1;
    let newOutUri: string = outURI;
    while (utils.fileExists(newOutUri)) {
        newOutUri = native.path.join(native.path.parse(outURI).dir, "(" + indexFile + ")" + native.path.basename(outURI));
        indexFile++;
    }

    outURI = newOutUri;

    try {
        format = getFileCoding(uri);
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
            Materialize.toast(lang.get_resource.Encrypt.search_decrypt_cert_failed, 2000, "toast-search_decrypt_cert_failed");
            return "";
        }

        cipher.recipientCert = certWithKey;
        cipher.privKey = key;

        cipher.decrypt(uri, outURI, format);

        return outURI;
    } catch (e) {
        return "";
    }
}
