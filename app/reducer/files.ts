import { Map, OrderedMap, Record } from "immutable";
import { ACTIVE_FILE, DELETE_FILE, SELECT_FILE } from "../constants";
import { arrayToMap } from "../utils";

const FileModel = Record({
  id: null,
  filename: null,
  lastModifiedDate: null,
  fullpath: null,
  extension: null,
  verified: false,
  active: true,
});

const DefaultReducerState = Record({
  entities: new OrderedMap({}),
});

export default (files = new DefaultReducerState(), action) => {
  const { type, payload, randomId } = action;

  switch (type) {
    case SELECT_FILE:
      return files.setIn(["entities", randomId], new FileModel({
        ...payload.file,
        id: randomId,
      }));

    case ACTIVE_FILE:
      if (!files.getIn(["entities", payload.fileId])) {
        return files;
      }

      return files.setIn(["entities", payload.fileId, "active"], payload.isActive);

    case DELETE_FILE:
      return files.deleteIn(["entities", payload.fileId]);
  }

  return files;
};
