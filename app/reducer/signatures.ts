import { Map, OrderedMap, Record } from "immutable";
import { FAIL, SUCCESS, VERIFY_SIGNATURE } from "../constants";
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
  entities: new OrderedMap({}),
});

export default (signatures = new DefaultReducerState(), action) => {
  const { type, payload, randomId } = action;

  switch (type) {
    case VERIFY_SIGNATURE + SUCCESS:
      return signatures.setIn(["entities", payload.fileId], arrayToMap(payload.signatureInfo, SignatureModel));
  }

  return signatures;
};
