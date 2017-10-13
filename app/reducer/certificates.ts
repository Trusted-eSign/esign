import { Map, OrderedMap, Record } from "immutable";
import { LOAD_ALL_CERTIFICATES, REMOVE_ALL_CERTIFICATES,
  START, SUCCESS, VERIFY_CERTIFICATE } from "../constants";
import { arrayToMap } from "../utils";

const CertificateModel = Record({
  active: false,
  category: null,
  format: null,
  hash: null,
  id: null,
  issuerFriendlyName: null,
  issuerName: null,
  key: null,
  notAfter: null,
  notBefore: null,
  organizationName: null,
  provider: null,
  serial: null,
  signatureAlgorithm: null,
  status: false,
  subjectFriendlyName: null,
  subjectName: null,
  type: null,
  uri: null,
  verified: false,
  version: null,
});

const DefaultReducerState = Record({
  entities: new OrderedMap({}),
  loaded: false,
  loading: false,
});

export default (certificates = new DefaultReducerState(), action) => {
  const { type, certs, payload } = action;
  switch (type) {
    case LOAD_ALL_CERTIFICATES + START:
      return certificates.set("loading", true);

    case LOAD_ALL_CERTIFICATES + SUCCESS:
      return certificates
        .update("entities", (entities) => arrayToMap(certs, CertificateModel).merge(entities))
        .set("loading", false)
        .set("loaded", true);

    case VERIFY_CERTIFICATE:
      return certificates
        .setIn(["entities", payload.certificateId, "status"], payload.certificateStatus)
        .setIn(["entities", payload.certificateId, "verified"], true);

    case REMOVE_ALL_CERTIFICATES:
      return certificates = new DefaultReducerState();
  }

  return certificates;
};
