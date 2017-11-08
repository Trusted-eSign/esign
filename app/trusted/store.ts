import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  ADDRESS_BOOK, CA, MY,
  PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM,
  ROOT, TRUST,
} from "../constants";
import { DEFAULT_CERTSTORE_PATH, DEFAULT_PATH, TMP_DIR } from "../constants";
import { lang } from "../module/global_app";
import { fileCoding } from "../utils";
import * as jwt from "./jwt";

const OS_TYPE = os.type();

export class Store {
  _items: any[];
  _providerSystem: trusted.pkistore.Provider_System;
  _providerCryptopro: trusted.pkistore.ProviderCryptopro;
  _providerMicrosoft: trusted.pkistore.ProviderMicrosoft;
  _store: trusted.pkistore.PkiStore;
  _rv: trusted.pki.Revocation;
  _certs: trusted.pki.CertificateCollection;

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
    this._providerSystem = new trusted.pkistore.Provider_System(DEFAULT_CERTSTORE_PATH);
    this._store = new trusted.pkistore.PkiStore(DEFAULT_CERTSTORE_PATH + "/cash.json");
    this._store.addProvider(this._providerSystem.handle);

    if (OS_TYPE === "Windows_NT") {
      this._providerMicrosoft = new trusted.pkistore.ProviderMicrosoft();
      this._store.addProvider(this._providerMicrosoft.handle);
    } else {
      try {
        this._providerCryptopro = new trusted.pkistore.ProviderCryptopro();
        this._store.addProvider(this._providerCryptopro.handle);
      } catch (e) {
        console.log(`Error init CryptoPro \n ${e}`);
      }
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
      const FORMAT: trusted.DataFormat = fileCoding(keyPath);
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

    TEMP_PKI_ITEMS.forEach(function (item: any, i: number): void {
      const TEMP_PATH: string = item.uri.substring(0, item.uri.lastIndexOf("."));
      const PUB_KEY: any = TEMP_PATH.substr(-40);

      if (newItem.hash === PUB_KEY && item.type === "CERTIFICATE") {
        TEMP_PKI_ITEMS[i].key = newItem.hash;
        res = true;
      }
    });

    this._items = TEMP_PKI_ITEMS;

    fs.writeFileSync(DEFAULT_CERTSTORE_PATH + "/cash.json", "{}", "utf8");

    this._store.cash.import(TEMP_PKI_ITEMS);

    this._items = this._items.concat(this._store.find({
      provider: ["CRYPTOPRO", "MICROSOFT"],
      type: ["CERTIFICATE"],
    }));

    return res;
  }

  importCertificate(certificate: trusted.pki.Certificate, providerType: string = PROVIDER_SYSTEM, done = (err?: Error) => { return; }): void {
    let provider;

    switch (providerType) {
      case PROVIDER_SYSTEM:
        provider = this._providerSystem;
        break;
      case PROVIDER_MICROSOFT:
        provider = this._providerMicrosoft;
        break;
      case PROVIDER_CRYPTOPRO:
        provider = this._providerCryptopro;
        break;
      default:
        Materialize.toast("Unsupported provider name", 2000, "toast-unsupported_provider_name");
    }

    if (!provider) {
      Materialize.toast(`Provider ${providerType} not init`, 2000, "toast-not_init_provider");
    }

    this.handleImportCertificate(certificate, this._store, provider, function(err: Error) {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
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

    this.importCertificate(cert);
    this.addKeyToStore(this._providerSystem, key, "");

    try {
      ca = p12.ca(pass);
    } catch (e) {
      ca = undefined;
    }

    if (ca) {
      for (let i: number = 0; i < ca.length; i++) {
        this.importCertificate(ca.items(i));
      }
    }

    return true;
  }

  handleImportCertificate(certificate: trusted.pki.Certificate | Buffer, store: trusted.pkistore.PkiStore, provider, callback) {
    const self = this;
    const cert = certificate instanceof trusted.pki.Certificate ? certificate : trusted.pki.Certificate.import(certificate);
    let urls = cert.CAIssuersUrls;
    const pathForSave = path.join(TMP_DIR, `certificate_${Date.now()}.cer`);
    let tempCert;

    if (provider instanceof trusted.pkistore.Provider_System) {
      const uri = store.addCert(provider.handle, MY, cert);
      const newItem = provider.objectToPkiItem(uri);

      const items = this._store.cash.export();
      let isNewItem = true;

      for (const item of items) {
        if (item.hash === newItem.hash) {
          isNewItem = false;
          break;
        }
      }

      if (isNewItem) {
        const ARR: any[] = [newItem];
        this._store.cash.import(ARR);

        this._items.push(newItem);
      }
    } else {
      const bCA = cert.isCA;
      const hasKey = provider.hasPrivateKey(cert);

      if (hasKey && !bCA) {
        store.addCert(provider.handle, MY, cert);
      } else if (!hasKey && !bCA) {
        store.addCert(provider.handle, ADDRESS_BOOK, cert);
      } else if (!hasKey && bCA) {
        store.addCert(provider.handle, CA, cert);
      }
    }

    if (!urls.length) {
      return callback();
    }

    trusted.pki.Certificate.download(urls, pathForSave, function(err, res) {
      if (err) {
        return callback(err);
      } else {
        tempCert = res;
        urls = tempCert.CAIssuersUrls;

        self.handleImportCertificate(tempCert, store, provider, callback);
      }
    });
  }

  downloadCRL(cert: any, done: (err: any, res?: any) => void): any {
    const SELF = this;
    const PATH_OUT: string = path.join(DEFAULT_PATH, "temp.crl");
    const RV: any = new trusted.pki.Revocation();
    const DIST_POINTS: string[] = RV.getCrlDistPoints(cert);
    let crl: any;

    if (DIST_POINTS.length === 0) {
      return;
    }

    RV.downloadCRL(DIST_POINTS, PATH_OUT, function (err: any, res: any) {
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
