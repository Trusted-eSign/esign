import { Map, OrderedMap, Record } from "immutable";
import { FAIL, PACKAGE_SIGN, START, SUCCESS, VERIFY_SIGNATURE } from "../constants";
import { arrayToMap } from "../utils";

const SignatureModel = Record({
  alg: null,
  certs: [],
  digestAlgorithm: null,
  fileId: null,
  id: null,
  status_verify: null,
  subject: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
  packageSignResult: false,
  signedPackage: false,
  signingPackage: false,
  verifyingPackage: false,
});

export default (signatures = new DefaultReducerState(), action) => {
  const { type, payload, randomId } = action;

  switch (type) {
    case PACKAGE_SIGN + START:
      return signatures
        .set("signedPackage", false)
        .set("signingPackage", true)
        .set("packageSignResult", false);

    case PACKAGE_SIGN + SUCCESS:
      return signatures
        .set("signedPackage", true)
        .set("signingPackage", false)
        .set("packageSignResult", payload.packageSignResult);

    case VERIFY_SIGNATURE + SUCCESS:
      return signatures.setIn(["entities", payload.fileId], arrayToMap(payload.signatureInfo, SignatureModel));
  }

  return signatures;
};
