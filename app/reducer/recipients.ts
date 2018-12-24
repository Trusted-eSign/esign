import { OrderedMap, Record } from "immutable";
import { ADD_RECIPIENT_CERTIFICATE, DELETE_RECIPIENT_CERTIFICATE, REMOVE_ALL_CERTIFICATES } from "../constants";

export const RecipientModel = Record({
  certId: null,
});

export const DefaultReducerState = Record({
  entities: OrderedMap({}),
});

export default (recipients = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_RECIPIENT_CERTIFICATE:
      return recipients.setIn(["entities", payload.certId], new RecipientModel({
        certId: payload.certId,
      }));

    case DELETE_RECIPIENT_CERTIFICATE:
      return recipients.deleteIn(["entities", payload.recipient]);

    case REMOVE_ALL_CERTIFICATES:
      return recipients = new DefaultReducerState();
  }

  return recipients;
};
