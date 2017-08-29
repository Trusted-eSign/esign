import { Map, OrderedMap, Record } from "immutable";
import { ADD_RECIPIENT_CERTIFICATE, DELETE_RECIPIENT_CERTIFICATE } from "../constants";

const RecipientModel = Record({
  certId: null,
});

const DefaultReducerState = Record({
  entities: new OrderedMap({}),
});

export default (recipients = new DefaultReducerState(), action) => {
  const { type, payload, randomId } = action;

  switch (type) {
    case ADD_RECIPIENT_CERTIFICATE:
      return recipients.setIn(["entities", payload.certId], new RecipientModel({
        certId: payload.certId,
      }));

    case DELETE_RECIPIENT_CERTIFICATE:
      return recipients.deleteIn(["entities", payload.recipient]);
  }

  return recipients;
};
