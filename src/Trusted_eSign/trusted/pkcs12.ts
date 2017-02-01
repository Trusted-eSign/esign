/// <reference path="../../../types/index.d.ts" />

export function loadPkcs12(path: string) {
    try {
        return trusted.pki.Pkcs12.load(path);
    } catch (e) {
        return undefined;
    }
}

export function createPkcs12(cert: trusted.pki.Certificate, key: trusted.pki.Key, ca: trusted.pki.CertificateCollection, pass: string, name: string) {
    let p12 = new trusted.pki.Pkcs12();
    return p12.create(cert, key, ca, pass, name);
}

export function getCertFromPkcs12(p12: trusted.pki.Pkcs12, pass: string): trusted.pki.Certificate {
    try {
        return p12.certificate(pass);
    } catch (e) {
        return undefined;
    }
}

export function getKeyFromPkcs12(p12: trusted.pki.Pkcs12, pass: string) {
    try {
        return p12.key(pass);
    } catch (e) {
        return undefined;
    }
}

export function getCAFromPkcs12(p12: trusted.pki.Pkcs12, pass: string) {
    try {
        return p12.ca(pass);
    } catch (e) {
        return undefined;
    }
}

export function save(p12: trusted.pki.Pkcs12, filename: string): void {
    p12.save(filename);
}
