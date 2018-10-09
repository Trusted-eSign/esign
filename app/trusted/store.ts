import * as os from "os";
import * as path from "path";
import {
  ADDRESS_BOOK, CA, MY,
  PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM,
  REQUEST, ROOT,
} from "../constants";
import { DEFAULT_CERTSTORE_PATH, TMP_DIR, USER_NAME } from "../constants";
import logger from "../winstonLogger";

const OS_TYPE = os.type();

export class Store {
  // tslint:disable:variable-name
  _items: any[];
  _providerSystem: trusted.pkistore.Provider_System;
  _providerMicrosoft: trusted.pkistore.ProviderMicrosoft;
  _store: trusted.pkistore.PkiStore;
  _rv: trusted.pki.Revocation | undefined;

  constructor() {
    this.init();

    this._items = this._store.cash.export();
    this._rv = new trusted.pki.Revocation();

    this._items = this._items.concat(this._store.find({
      provider: ["MICROSOFT"],
      type: ["CERTIFICATE"],
    }));
  }

  init() {
    this._providerSystem = new trusted.pkistore.Provider_System(DEFAULT_CERTSTORE_PATH);
    this._store = new trusted.pkistore.PkiStore(DEFAULT_CERTSTORE_PATH + "/cash.json");

    if (OS_TYPE === "Windows_NT") {
      this._providerMicrosoft = new trusted.pkistore.ProviderMicrosoft();
      this._store.addProvider(this._providerMicrosoft.handle);
    }

    this._items = this._store.cash.export();

    this._items = this._items.concat(this._store.find({
      provider: ["CRYPTOPRO", "MICROSOFT"],
      type: ["CERTIFICATE", "CRL"],
    }));
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
        Materialize.toast(localize("Key.key_load_failed", window.locale), 2000, "toast-key_load_failed");

        return false;
      }

      return this.addKeyToStore(key, "");
    } catch (e) {
      return false;
    }
  }

  addKeyToStore(key: trusted.pki.Key, password: string = "", provider?: any): boolean {
    const ITEMS = this._store.cash.export();
    let uri: string;
    let newItem: any;
    let res: boolean = false;

    if (!provider) {
      provider = this._providerSystem;
    }

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
      provider: ["MICROSOFT"],
      type: ["CERTIFICATE"],
    }));

    return res;
  }

  importCertificate(certificate: trusted.pki.Certificate, providerType: string = PROVIDER_SYSTEM, done = (err?: Error) => { return; }, category?: string,  contName?: string): void {
    let provider;

    switch (providerType) {
      case PROVIDER_SYSTEM:
        provider = this._providerSystem;
        break;
      case PROVIDER_MICROSOFT:
        provider = this._providerMicrosoft;
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
    }, category, contName);
  }

  deleteCertificate(certificate: trusted.pkistore.PkiItem): boolean {
    let provider;

    switch (certificate.provider) {
      case "SYSTEM":
        provider = this._providerSystem;
        break;
      case "MICROSOFT":
        provider = this._providerMicrosoft;
        break;
      default:
        Materialize.toast("Unsupported provider name", 2000, "toast-unsupported_provider_name");
    }

    if (!provider) {
      Materialize.toast(`Provider ${certificate.provider} not init`, 2000, "toast-not_init_provider");
      return false;
    }

    const certX509 = this.getPkiObject(certificate);

    try {
      this._store.deleteCert(provider.handle, certificate.category, certX509);

      logger.log({
        certificate: certificate.subjectName,
        level: "info",
        message: "",
        operation:  localize("Events.cert_delete", window.locale),
        operationObject: {
          in: "CN=" + certificate.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });
    } catch (err) {
      logger.log({
        certificate: certificate.subjectName,
        level: "error",
        message: err.message ? err.message : err,
        operation: localize("Events.cert_delete", window.locale),
        operationObject: {
          in: "CN=" + certificate.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });

      return false;
    }

    return true;
  }

  handleImportCertificate(certificate: trusted.pki.Certificate | Buffer, store: trusted.pkistore.PkiStore, provider: any, callback: any, category?: string, contName?: string) {
    const self = this;
    const cert = certificate instanceof trusted.pki.Certificate ? certificate : trusted.pki.Certificate.import(certificate);
    const pathForSave = path.join(TMP_DIR, `certificate_${Date.now()}.cer`);

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
      const selfSigned = cert.isSelfSigned;
      const hasKey = provider.hasPrivateKey(cert);

      if (category) {
        store.addCert(provider.handle, category, cert, contName, 75);
      } else {
        if (hasKey) {
          store.addCert(provider.handle, MY, cert, contName, 75);
        } else if (!hasKey && !bCA) {
          store.addCert(provider.handle, ADDRESS_BOOK, cert, contName, 75);
        } else if (bCA) {
          if (OS_TYPE === "Windows_NT") {
            selfSigned ? store.addCert(provider.handle, ROOT, cert, contName, 75) : store.addCert(provider.handle, CA, cert, contName, 75);
          }
        }
      }
    }

    return callback();

    /*if (!urls.length) {
      return callback();
    }

    trusted.pki.Certificate.download(urls, pathForSave, function (err, res) {
      if (err) {
        return callback(err);
      } else {
        tempCert = res;
        urls = tempCert.CAIssuersUrls;

        self.handleImportCertificate(tempCert, store, provider, callback);
      }
    });*/
  }

  addCrlToStore(provider: any, category: any, crl: any, flag: any): void {
    let items: any;
    let uri: string;
    let newItem: any;

    uri = this._store.addCrl(provider.handle, category, crl);

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
    if (!this._rv) {
      this._rv = new trusted.pki.Revocation();
    }

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
          console.log(this._store.getItem(objectWithKey));
          keyItem = this._providerMicrosoft.getKey(this._store.getItem(objectWithKey));
          console.log(keyItem);
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
      console.log(this._items[i]);
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
    console.log(keyItem);
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
