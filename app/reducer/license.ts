import { Map, OrderedMap, Record } from "immutable";
import { FAIL, LOAD_LICENSE,
  START, SUCCESS, VERIFY_LICENSE } from "../constants";
import { arrayToMap } from "../utils";

const LicenseModel = Record({
  aud: "-",
  exp: "-",
  iat: "-",
  iss: "-",
  jti: "-",
  sub: "-",
});

const DefaultReducerState = Record({
  license: new LicenseModel(),
  loaded: false,
  loading: false,
  status: null,
  verified: false,
});

export default (license = new DefaultReducerState(), action) => {
  const { type, lic, payload } = action;

  switch (type) {
    case LOAD_LICENSE + START:
      return license.set("loading", true);

    case LOAD_LICENSE + SUCCESS:
      return license
        .set("license", new LicenseModel(lic))
        .set("loading", false)
        .set("loaded", true);
  }

  return license;
};
