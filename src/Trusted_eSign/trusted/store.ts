/// <reference path="../../../types/index.d.ts" />
// tslint:disable:variable-name

import { lang } from "../module/global_app";
import * as native from "../native";
import { utils } from "../utils";
import * as jwt from "./jwt";

const OS_TYPE = native.os.type();

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
      type: ["CERTIFICATE"],
    }));
  }

  init() {
    this._providerSystem = new trusted.pkistore.Provider_System(native.DEFAULT_CERTSTORE_PATH);
    this._store = new trusted.pkistore.PkiStore(native.DEFAULT_CERTSTORE_PATH + "/cash.json");
    this._store.addProvider(this._providerSystem.handle);

    if (OS_TYPE === "Windows_NT") {
      this._providerMicrosoft = new trusted.pkistore.ProviderMicrosoft();
      this._store.addProvider(this._providerMicrosoft.handle);
    }
  }

  get items(): trusted.pkistore.PkiItem[] {
    return this._items;
  }

  get trustedCerts(): trusted.pki.CertificateCollection {
    const RESULT: trusted.pki.CertificateCollection = new trusted.pki.CertificateCollection();
    const ITEMS = this._store.find({
      category: ["ROOT", "CA"],
      type: ["CERTIFICATE"],
    });

    for (const item of ITEMS) {
      RESULT.push(this.getPkiObject(item));
    }

    return RESULT;
  }

  // tslint:disable-next-line:adjacent-overload-signatures
  set items(pkiItems: trusted.pkistore.PkiItem[]) {
    this._items = pkiItems;
  }

  find(filter: JSON) {
    return this._store.find(filter);
  }

  importKey(keyPath: string, pass: string): boolean {
    try {
      const FORMAT: trusted.DataFormat = getFileCoding(keyPath);
      let key: trusted.pki.Key;

      try {
        key = trusted.pki.Key.readPrivateKey(keyPath, FORMAT, pass);
      } catch (e) {
        $(".toast-key_load_failed").remove();
        Materialize.toast(lang.get_resource.Key.key_load_failed, 2000, "toast-key_load_failed");

        return undefined;
      }

      return this.addKeyToStore(this._providerSystem, key, "");
    } catch (e) {
      return undefined;
    }
  }

  addKeyToStore(provider: any, key: trusted.pki.Key, password: string): boolean {
    const ITEMS = this._store.cash.export();
    let uri: string;
    let newItem: any;
    let res: boolean = false;

    uri = this._store.addKey(provider.handle, key, password);
    newItem = provider.objectToPkiItem(uri);

    for (const item of ITEMS) {
      if (item.hash === newItem.hash) {
        return res;
      }
    }

    const ARR = [newItem];
    this._store.cash.import(ARR);

    this._items = this._store.cash.export();

    const TEMP_PKI_ITEMS = this._items.slice(0);

    TEMP_PKI_ITEMS.forEach(function(item: any, i: number): void {
      const TEMP_PATH: string = item.uri.substring(0, item.uri.lastIndexOf("."));
      const PUB_KEY: any = TEMP_PATH.substr(-40);

      if (newItem.hash === PUB_KEY && item.type === "CERTIFICATE") {
        TEMP_PKI_ITEMS[i].key = newItem.hash;
        res = true;
      }
    });

    this._items = TEMP_PKI_ITEMS;

    native.fs.writeFileSync(native.DEFAULT_CERTSTORE_PATH + "/cash.json", "{}", "utf8");

    this._store.cash.import(TEMP_PKI_ITEMS);

    this._items = this._items.concat(this._store.find({
      provider: ["CRYPTOPRO", "MICROSOFT"],
      type: ["CERTIFICATE"],
    }));

    return res;
  }

  importCert(certPath: string): boolean {
    const FORMAT: trusted.DataFormat = getFileCoding(certPath);
    let certificate: trusted.pki.Certificate;

    try {
      certificate = trusted.pki.Certificate.load(certPath, FORMAT);
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
    let items: any;
    let uri: string;
    let newItem: any;
    let key: any;

    uri = this._store.addCert(provider.handle, category, cert, flag);
    newItem = provider.objectToPkiItem(uri);

    if (OS_TYPE === "Windows_NT" && newItem.provider === "MICROSOFT") {
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

    for (const item of items) {
      if (item.hash === newItem.hash) {
        if (key) {
          this.addKeyToStore(this._providerSystem, key, "");
        }

        return;
      }
    }

    const ARR: any[] = [newItem];
    this._store.cash.import(ARR);

    this._items.push(newItem);

    if (key) {
      this.addKeyToStore(this._providerSystem, key, "");
    }
  }

  downloadCRL(cert: any, done: (err: any, res?: any) => void): any {
    const SELF = this;
    const PATH_OUT: string = native.path.join(native.DEFAULT_PATH, "temp.crl");
    const RV: any = new trusted.pki.Revocation();
    const DIST_POINTS: string[] = RV.getCrlDistPoints(cert);
    let crl: any;

    if (DIST_POINTS.length === 0) {
      return;
    }

    RV.downloadCRL(DIST_POINTS, PATH_OUT, function(err: any, res: any) {
      if (err) {
        done(err);
      } else {
        crl = res;

        SELF.addCrlToStore(SELF._providerSystem, "CRL", crl, 0);

        done(null, crl);
      }
    });
  }

  importCRL(crlPath: string): number {
    const CRL: trusted.pki.Crl = trusted.pki.Crl.load(crlPath);

    if (!CRL) {
      return 0;
    } else {
      this.addCrlToStore(this._providerSystem, "CRL", CRL, 0);
      return 1;
    }
  }

  addCrlToStore(provider: any, category: any, crl: any, flag: any): void {
    let items: any;
    let uri: string;
    let newItem: any;

    uri = this._store.addCrl(provider.handle, category, crl, flag);

    newItem = provider.objectToPkiItem(uri);
    items = this._store.cash.export();

    for (const item of items) {
      if (item.hash === newItem.hash) {
        return;
      }
    }

    const ARR = [newItem];
    this._store.cash.import(ARR);

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

    if (OS_TYPE === "Windows_NT") {
      if (objectWithKey.provider === "MICROSOFT") {
        try {
          keyItem = this._providerMicrosoft.getKey(this._store.getItem(objectWithKey));
        } catch (err) {
          // const JWT_RES: number = jwt.checkLicense();
          // if (JWT_RES) {
          //   $(".toast-jwt_error").remove();
          //   Materialize.toast(jwt.getErrorMessage(JWT_RES), 4000, "toast-jwt_error");
          //   return;
          // }
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
          // const JWT_RES: number = jwt.checkLicense();
          // if (JWT_RES) {
          //   $(".toast-jwt_error").remove();
          //   Materialize.toast(jwt.getErrorMessage(JWT_RES), 4000, "toast-jwt_error");
          //   return;
          // }
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
