import { Map, OrderedMap, Record } from "immutable";
import {
  FAIL, LOAD_LICENSE,
  START, SUCCESS, VERIFY_LICENSE
} from "../constants";
import { arrayToMap } from "../utils";

const LicenseModel = Record({
  aud: "-",
  exp: null,
  iat: null,
  iss: "-",
  jti: "-",
  sub: "-",
});

const DefaultReducerState = Record({
  data: null,
  info: new LicenseModel(),
  //lic_trial_verified: null,
  lic_error: null,
  lic_format: null,
  loaded: false,
  loading: false,
  status: null,
  verified: false,
});

export default (license = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_LICENSE + START:
      return license
        .set("loading", true)
        //.set("lic_format", payload.lic_format)
        .set("loaded", false);
       // .set("verified", payload.verified)        
       // .set("status", payload.licenseStatus);

    case LOAD_LICENSE + SUCCESS:
      return license
        .set("info", new LicenseModel(payload.lic))
        .set("data", payload.data)
        .set("loading", false)
        .set("loaded", true)
        .set("verified", payload.verified) 
        .set("lic_format", payload.lic_format)
        .set("lic_error", payload.lic_error)
        .set("status", payload.licenseStatus);

    case LOAD_LICENSE + FAIL:
      return license
        .set("loading", false)
        .set("loaded", false)
        .set("status", 0)
        .set("verified", payload.verified) 
        .set("lic_error", payload.lic_error)
        .set("lic_format", payload.lic_format);

    case VERIFY_LICENSE:
      return license
        .set("status", payload.licenseStatus)
        .set("verified", true)
        .set("lic_format", payload.lic_format);
  }

  return license;
};
