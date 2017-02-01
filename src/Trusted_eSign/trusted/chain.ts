/// <reference path="../../../types/index.d.ts" />

export function buildChain(cert: trusted.pki.Certificate, certs: trusted.pki.CertificateCollection): trusted.pki.CertificateCollection {
    let chain = new trusted.pki.Chain();

    try {
        return chain.buildChain(cert, certs);
    } catch (e) {
        return undefined;
    }
}

export function verifyChain(chainVerify: trusted.pki.CertificateCollection, crls: trusted.pki.CrlCollection): boolean {

    try {
        let chain = new trusted.pki.Chain();

        return chain.verifyChain(chainVerify, crls);
    } catch (e) {
        return undefined;
    }
}
