import {
  BASE64,
  CHANGE_SIGNATURE_DETACHED, CHANGE_SIGNATURE_ENCODING,
  CHANGE_SIGNATURE_OUTFOLDER, CHANGE_SIGNATURE_TIMESTAMP,
} from "../constants";

const defaultSettings = {
  sign: {
    detached: false,
    encoding: BASE64,
    outfolder: "",
    timestamp: false,
  },
};

export default (settings = defaultSettings, action) => {
  const { type, payload } = action;

  switch (type) {
    case CHANGE_SIGNATURE_DETACHED:
      return { ...settings, sign: { ...settings.sign, detached: payload.detached } };

    case CHANGE_SIGNATURE_ENCODING:
      return { ...settings, sign: { ...settings.sign, encoding: payload.encoding } };

    case CHANGE_SIGNATURE_OUTFOLDER:
      return { ...settings, sign: { ...settings.sign, outfolder: payload.outfolder } };

    case CHANGE_SIGNATURE_TIMESTAMP:
      return { ...settings, sign: { ...settings.sign, timestamp: payload.timestamp } };
  }

  return settings;
};
