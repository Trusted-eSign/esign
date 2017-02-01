/// <reference path="../../../types/index.d.ts" />

export function loadCRL(path: string): trusted.pki.Crl {
    return trusted.pki.Crl.load(path);
}

export function checkCrlTime(crl: trusted.pki.Crl): boolean {
    let rv: trusted.pki.Revocation = new trusted.pki.Revocation();
    return rv.checkCrlTime(crl);
}
