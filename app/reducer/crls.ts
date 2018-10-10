import { OrderedMap, Record } from "immutable";
import { LOAD_ALL_CERTIFICATES, REMOVE_ALL_CERTIFICATES,
  START, SUCCESS, VERIFY_CERTIFICATE } from "../constants";
import { arrayToMap } from "../utils";

const CRLModel = Record({
  active: false,
  authorityKeyid: null,
  category: null,
  crlNumber: null,
  format: null,
  hash: null,
  id: null,
  issuerFriendlyName: null,
  issuerName: null,
  lastUpdate: null,
  nextUpdate: null,
  provider: null,
  signatureAlgorithm: null,
  signatureDigestAlgorithm: null,
  type: null,
  uri: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
  loaded: false,
  loading: false,
});

export default (CRLs = new DefaultReducerState(), action) => {
  const { type, crls } = action;
  switch (type) {
    case LOAD_ALL_CERTIFICATES + START:
      return CRLs.set("loading", true);

    case LOAD_ALL_CERTIFICATES + SUCCESS:
      return CRLs
        .update("entities", (entities) => arrayToMap(crls, CRLModel).merge(entities))
        .set("loading", false)
        .set("loaded", true);

    case REMOVE_ALL_CERTIFICATES:
      return CRLs = new DefaultReducerState();
  }

  return CRLs;
};
