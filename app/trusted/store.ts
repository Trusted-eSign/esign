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
  _providerSystem: trusted.pkistore.Provider_System | undefined;
  _providerCryptopro: trusted.pkistore.ProviderCryptopro | undefined;
  _providerMicrosoft: trusted.pkistore.ProviderMicrosoft | undefined;
  _store: trusted.pkistore.PkiStore;
  _rv: trusted.pki.Revocation | undefined;

  constructor() {
    this._store = new trusted.pkistore.PkiStore(DEFAULT_CERTSTORE_PATH + "/cash.json");

    if (OS_TYPE === "Windows_NT") {
      this._providerMicrosoft = new trusted.pkistore.ProviderMicrosoft();
      this._store.addProvider(this._providerMicrosoft.handle);
    } else {
      try {
        this._providerCryptopro = new trusted.pkistore.ProviderCryptopro();
        this._store.addProvider(this._providerCryptopro.handle);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(`Error init CryptoPro \n ${e}`);
      }
    }

    this._items = [];

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

  importCertificate(certificate: trusted.pki.Certificate, providerType: string = PROVIDER_SYSTEM, done = (err?: Error) => { return; }, category?: string, contName?: string): void {
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

    this.handleImportCertificate(certificate, this._store, provider, function (err: Error) {
      if (err) {
        done(err);
      } else {
        done();
      }
    }, category, contName);
  }

  handleImportCertificate(certificate: trusted.pki.Certificate | Buffer, store: trusted.pkistore.PkiStore, provider: any, callback: any, category?: string, contName?: string) {
    const cert = certificate instanceof trusted.pki.Certificate ? certificate : trusted.pki.Certificate.import(certificate);

    if (provider instanceof trusted.pkistore.Provider_System) {
      const uri = store.addCert(provider.handle, MY, cert);
      const newItem = provider.objectToPkiItem(uri);

      const items: native.PKISTORE.IPkiItem[] = [];
      let isNewItem = true;

      for (const item of items) {
        if (item.hash === newItem.hash) {
          isNewItem = false;
          break;
        }
      }

      if (isNewItem) {
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
  }

  importCrl(crl: trusted.pki.Crl, providerType: string = PROVIDER_SYSTEM, done = (err?: Error) => { return; }): void {
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

    this.handleImportCrl(crl, this._store, provider, function(err: Error) {
      if (err) {
        done(err);
      } else {
        done();
      }
    });
  }

  handleImportCrl(crl: trusted.pki.Crl, store: trusted.pkistore.PkiStore, provider: any, callback: any) {
    if (OS_TYPE === "Windows_NT") {
      store.addCrl(provider.handle, CA, crl);
    }

    return callback();
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
      case "CRYPTOPRO":
        provider = this._providerCryptopro;
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
        operation: "Удаление сертификата",
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
        operation: "Удаление сертификата",
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

  deleteCrl(crl: trusted.pkistore.PkiItem): boolean {
    let provider;

    switch (crl.provider) {
      case "SYSTEM":
        provider = this._providerSystem;
        break;
      case "MICROSOFT":
        provider = this._providerMicrosoft;
        break;
      case "CRYPTOPRO":
        provider = this._providerCryptopro;
        break;
      default:
        Materialize.toast("Unsupported provider name", 2000, "toast-unsupported_provider_name");
    }

    if (!provider) {
      Materialize.toast(`Provider ${crl.provider} not init`, 2000, "toast-not_init_provider");
      return false;
    }

    const crlX509 = this.getPkiObject(crl);

    try {
      this._store.deleteCrl(provider.handle, crl.category, crlX509);

      logger.log({
        certificate: crl.subjectName,
        level: "info",
        message: "",
        operation: "Удаление сертификата",
        operationObject: {
          in: "CN=" + crl.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });
    } catch (err) {
      logger.log({
        certificate: crl.subjectName,
        level: "error",
        message: err.message ? err.message : err,
        operation: "Удаление сертификата",
        operationObject: {
          in: "CN=" + crl.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });

      return false;
    }

    return true;
  }

  addCrlToStore(provider: any, category: any, crl: any, flag: any): void {
    let uri: string;
    let newItem: any;

    uri = this._store.addCrl(provider.handle, category, crl);

    newItem = provider.objectToPkiItem(uri);

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
          if (this._providerMicrosoft) {
            keyItem = this._providerMicrosoft.getKey(this._store.getItem(objectWithKey));
          }
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
          if (this._providerCryptopro) {
            keyItem = this._providerCryptopro.getKey(this._store.getItem(objectWithKey));
          }
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
    let tcert: trusted.pki.Certificate | undefined;

    if (item.x509 && item.service) {
      try {
        tcert = new trusted.pki.Certificate();
        tcert.import(Buffer.from(item.x509), trusted.DataFormat.PEM);

        return tcert;
      } catch (e) {
        //
      }
    }

    return this._store.getItem(item);
  }
}
