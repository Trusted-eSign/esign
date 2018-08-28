import {
  BASE64, CHANGE_ARCHIVE_FILES_BEFORE_ENCRYPT, CHANGE_DELETE_FILES_AFTER_ENCRYPT,
  CHANGE_DSS_AUTH_URL, CHANGE_DSS_REST_URL, CHANGE_ECRYPT_ENCODING, CHANGE_ENCRYPT_OUTFOLDER,
  CHANGE_LOCALE, CHANGE_SIGNATURE_DETACHED,
  CHANGE_SIGNATURE_ENCODING, CHANGE_SIGNATURE_OUTFOLDER, CHANGE_SIGNATURE_TIMESTAMP,
  RU, TOGGLE_SAVE_TO_DOCUMENTS,
} from "../constants";

const defaultSettings = {
  cloudCSP: {
    authURL: "https://dss.cryptopro.ru/STS/oauth",
    restURL: "https://dss.cryptopro.ru/SignServer/rest",
  },
  encrypt: {
    archive: false,
    delete: false,
    encoding: BASE64,
    outfolder: "",
  },
  locale: RU,
  saveToDocuments: false,
  sign: {
    detached: false,
    encoding: BASE64,
    outfolder: "",
    timestamp: true,
  },
};

export default (settings = defaultSettings, action) => {
  const { type, payload } = action;

  switch (type) {
    case TOGGLE_SAVE_TO_DOCUMENTS:
      return { ...settings, saveToDocuments: payload.saveToDocuments };

    case CHANGE_SIGNATURE_DETACHED:
      return { ...settings, sign: { ...settings.sign, detached: payload.detached } };

    case CHANGE_SIGNATURE_ENCODING:
      return { ...settings, sign: { ...settings.sign, encoding: payload.encoding } };

    case CHANGE_SIGNATURE_OUTFOLDER:
      return { ...settings, sign: { ...settings.sign, outfolder: payload.outfolder } };

    case CHANGE_SIGNATURE_TIMESTAMP:
      return { ...settings, sign: { ...settings.sign, timestamp: payload.timestamp } };

    case CHANGE_ARCHIVE_FILES_BEFORE_ENCRYPT:
      return { ...settings, encrypt: { ...settings.encrypt, archive: payload.archive } };

    case CHANGE_DELETE_FILES_AFTER_ENCRYPT:
      return { ...settings, encrypt: { ...settings.encrypt, delete: payload.del } };

    case CHANGE_ECRYPT_ENCODING:
      return { ...settings, encrypt: { ...settings.encrypt, encoding: payload.encoding } };

    case CHANGE_ENCRYPT_OUTFOLDER:
      return { ...settings, encrypt: { ...settings.encrypt, outfolder: payload.outfolder } };
    case CHANGE_LOCALE:
      return { ...settings, locale: payload.locale };

    case CHANGE_DSS_AUTH_URL:
      return { ...settings, cloudCSP: { ...settings.cloudCSP, authURL: payload.authURL } };

    case CHANGE_DSS_REST_URL:
      return { ...settings, cloudCSP: { ...settings.cloudCSP, restURL: payload.restURL } };
  }

  return settings;
};
