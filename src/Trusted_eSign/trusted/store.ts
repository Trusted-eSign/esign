/// <reference path="../../../types/index.d.ts" />

import { lang } from "../module/global_app";
import * as native from "../native";
import { utills } from "../utills";
import * as jwt from "./jwt";

let osType = native.os.type();

export class Store {
    private _items: any[];
    private _providerSystem: trusted.pkistore.Provider_System;
    private _providerCryptopro: trusted.pkistore.ProviderCryptopro;
    private _providerMicrosoft: trusted.pkistore.ProviderMicrosoft;
    private _store: trusted.pkistore.PkiStore;
    private _rv: trusted.pki.Revocation;
    private _certs: trusted.pki.CertificateCollection;

    constructor() {
        this.init();

        this._items = this._store.cash.export();
        this._rv = new trusted.pki.Revocation();

        this._items = this._items.concat(this._store.find({
            provider: ["CRYPTOPRO", "MICROSOFT"],
            type: ["CERTIFICATE"]
        }));
    }

    init() {
        this._providerSystem = new trusted.pkistore.Provider_System(native.DEFAULT_CERTSTORE_PATH);
        this._store = new trusted.pkistore.PkiStore(native.DEFAULT_CERTSTORE_PATH + "/cash.json");
        this._store.addProvider(this._providerSystem.handle);

        if (osType === "Windows_NT") {
            this._providerMicrosoft = new trusted.pkistore.ProviderMicrosoft();
            this._store.addProvider(this._providerMicrosoft.handle);
        } //else {
          //  this._providerCryptopro = new trusted.pkistore.ProviderCryptopro();
          //  this._store.addProvider(this._providerCryptopro.handle);
       // }
    }

    get items(): trusted.pkistore.PkiItem[] {
        return this._items;
    };

    get trustedCerts(): trusted.pki.CertificateCollection {
        let res: trusted.pki.CertificateCollection = new trusted.pki.CertificateCollection();
        let resItems = this._store.find({
            category: ["ROOT", "CA"],
            type: ["CERTIFICATE"]
        });

        for(let i = 0; i < resItems.length; i++) {
            res.push(this.getPkiObject(resItems[i]));
        }

        return res;
    };

    /**
     * Set PkiItems
     * @param  {Array<Object>} pkiItems
     */
    set items(pkiItems: trusted.pkistore.PkiItem[]) {
        this._items = pkiItems;
    };

    find(filter: JSON) {
        return this._store.find(filter);
    }

    importKey(keyPath: string, pass: string): boolean {
        try {
            let format: trusted.DataFormat = getFileCoding(keyPath);
            let key: trusted.pki.Key;

            try {
                key = trusted.pki.Key.readPrivateKey(keyPath, format, pass);
            } catch (e) {
                $(".toast-key_load_failed").remove();
                Materialize.toast(lang.get_resource.Key.key_load_failed, 2000, "toast-key_load_failed");

                return undefined;
            }

            return this.addKeyToStore(this._providerSystem, key, "");
        } catch (e) {
            return false;
        }
    }

    addKeyToStore(provider: any, key: trusted.pki.Key, password: string): boolean {
        let items: any;
        let uri: string;
        let newItem: any;
        let res: boolean = false;

        uri = this._store.addKey(provider.handle, key, password);

        newItem = provider.objectToPkiItem(uri);
        items = this._store.cash.export();

        for (let i: number = 0; i < items.length; i++) {
            if (items[i].hash === newItem.hash) {
                return res;
            }
        }

        let arr: any[] = [newItem];
        this._store.cash.import(arr);

        this._items = this._store.cash.export();

        let tempPkiItems: any[] = this.items.slice(0);

        tempPkiItems.forEach(function (item: any, i: number): void {
            let tempPath: string = item.uri.substring(0, item.uri.lastIndexOf("."));
            let pubKey: any = tempPath.substr(-40);

            if (newItem.hash === pubKey && item.type === "CERTIFICATE") {
                tempPkiItems[i].key = newItem.hash;
                res = true;
            }
        });

        this._items = tempPkiItems;

        native.fs.writeFileSync(native.DEFAULT_CERTSTORE_PATH + "/cash.json", "{}", "utf8");

        this._store.cash.import(tempPkiItems);

        this._items = this._items.concat(this._store.find({
            category: ["MY"],
            provider: ["CRYPTOPRO", "MICROSOFT"],
            type: ["CERTIFICATE"]
        }));

        return res;
    }

    importCert(certPath: string): boolean {
        let format: trusted.DataFormat = getFileCoding(certPath);
        let certificate: trusted.pki.Certificate;

        try {
            certificate = trusted.pki.Certificate.load(certPath, format);
        } catch (e) {
            $(".toast-cert_load_failed").remove();
            Materialize.toast(lang.get_resource.Certificate.cert_load_failed, 2000, "toast-cert_load_failed");

            return undefined;
        }

        this.addCertToStore(this._providerSystem, "MY", certificate, 0);
        return true;
    }

    importPkcs12(p12Path: string, pass: string): boolean {
        let p12: trusted.pki.Pkcs12;
        let cert: trusted.pki.Certificate;
        let key: trusted.pki.Key;
        let ca: trusted.pki.CertificateCollection;

        try {
            p12 = trusted.pki.Pkcs12.load(p12Path);
            cert = p12.certificate(pass);
            key = p12.key(pass);
        } catch (e) {
            return undefined;
        }

        if (!cert || !key) {
            return undefined;
        }

        this.addCertToStore(this._providerSystem, "MY", cert, 0);
        this.addKeyToStore(this._providerSystem, key, "");

        try {
            ca = p12.ca(pass);
        } catch (e) {
            ca = undefined;
        }

        if (ca) {
            for (let i: number = 0; i < ca.length; i++) {
                this.addCertToStore(this._providerSystem, "MY", ca.items(i), 0);
            }
        }

        return true;
    }

    addCertToStore(provider: any, category: any, cert: any, flag: any): void {
        "use strict";

        let items: any;
        let uri: string;
        let newItem: any;
        let key: any;

        uri = this._store.addCert(provider.handle, category, cert, flag);
        newItem = provider.objectToPkiItem(uri);

        if (osType === "Windows_NT" && newItem.provider === "MICROSOFT") {
            try {
                key = this._providerMicrosoft.getKey(cert);
            } catch (e) {
                key = undefined;
            }
        } else {
            try {
                key = this._providerCryptopro.getKey(cert);
            } catch (e) {
                key = undefined;
            }
        }

        items = this._store.cash.export();

        for (let i: number = 0; i < items.length; i++) {
            if (items[i].hash === newItem.hash) {
                if (key) {
                    this.addKeyToStore(this._providerSystem, key, "");
                };

                return;
            }
        }

        let arr: any[] = [newItem];
        this._store.cash.import(arr);

        this._items.push(newItem);

        if (key) {
            this.addKeyToStore(this._providerSystem, key, "");
        }
    }

    downloadCRL(cert: any, done: Function): any {
        let self = this;
        let pathOut: string = native.path.join(native.DEFAULT_PATH, "temp.crl");
        let crl: any;
        let rv: any = new trusted.pki.Revocation();

        let distPoints: string[] = rv.getCrlDistPoints(cert);
        if (distPoints.length === 0) {
            return;
        }
        rv.downloadCRL(distPoints, pathOut, function (err: any, res: any) {
            if (err) {
                done(err);
            } else {
                crl = res;

                self.addCrlToStore(self._providerSystem, "CRL", crl, 0);

                done(null, crl);
            }
        });
    }

    importCRL(crlPath: string): number {
        let crl: trusted.pki.Crl = trusted.pki.Crl.load(crlPath);

        if (!crl) {
            return 0;
        } else {
            this.addCrlToStore(this._providerSystem, "CRL", crl, 0);
            return 1;
        }
    }

    addCrlToStore(provider: any, category: any, crl: any, flag: any): void {
        "use strict";

        let items: any;
        let uri: string;
        let newItem: any;

        uri = this._store.addCrl(provider.handle, category, crl, flag);

        newItem = provider.objectToPkiItem(uri);
        items = this._store.cash.export();

        for (let i: number = 0; i < items.length; i++) {
            if (items[i].hash === newItem.hash) {
                return;
            }
        }

        let arr: any[] = [newItem];
        this._store.cash.import(arr);

        this._items.push(newItem);
    }

    /**
     * Search crl for certificate in local store
     */
    getCrlLocal(cert: any): any {
        return this._rv.getCrlLocal(cert, this._store);
    }

    /**
     * Find key for PkiItem
     * @param  {native.PKISTORE.PkiItem} objectWithKey
     * @return {native.PKISTORE.PkiItem}
     */
    findKey(objectWithKey: any) {
        let keyItem: any;

        if (osType === "Windows_NT") {
            if (objectWithKey.provider === "MICROSOFT") {
                try {
                    keyItem = this._providerMicrosoft.getKey(this._store.getItem(objectWithKey));
                } catch (err) {
                //    let jwtRes: number = jwt.checkLicense();
                //    if (jwtRes) {
                //        $(".toast-jwt_error").remove();
                //        Materialize.toast(jwt.getErrorMessage(jwtRes), 4000, "toast-jwt_error");
                //        return;
                //    }
                }

                if (!keyItem) {
                    return;
                } else {
                    return keyItem;
                }
            }
        } else {
            if (objectWithKey.provider === "CRYPTOPRO") {
                try {
                    keyItem = this._providerCryptopro.getKey(this._store.getItem(objectWithKey));
                } catch (err) {
                //    let jwtRes: number = jwt.checkLicense();
                //    if (jwtRes) {
                //        $(".toast-jwt_error").remove();
                //        Materialize.toast(jwt.getErrorMessage(jwtRes), 4000, "toast-jwt_error");
                //        return;
                //    }
                }

                if (!keyItem) {
                    return;
                } else {
                    return keyItem;
                }
            }
        }

        for (let i: number = 0, c: number = this._items.length; i < c; i++) {
            let result: number = 1;

            if (this._items[i].hash === objectWithKey.hash) {
                result = 1;
            } else {
                result = 0;
                continue;
            }

            if (result) {
                let keyHash: string = "";

                if (this._items[i].key) {
                    keyHash = this._items[i].key;
                } else {
                    return;
                }

                for (let j: number = 0; j < this._items.length; j++) {
                    if ((this._items[j].type === "KEY") &&
                        (this._items[j].hash === keyHash)) {
                        keyItem = this._items[j];
                        break;
                    }
                }
                break;
            }
        }

        return this._store.getItem(keyItem);
    }

    /**
     * Return pki objects for PkiItem
     * @param  {native.PKISTORE.PkiItem} item
     * @return {PkiObject} Certificate | Key | CRL | CSR
     */
    getPkiObject(item: any): any {
        return this._store.getItem(item);
    }
}
