import { Map, OrderedMap, Record } from "immutable";
import { ACTIVE_FILE, DELETE_FILE, SELECT_FILE, SUCCESS, VERIFY_SIGNATURE } from "../constants";

const FileModel = Record({
  active: true,
  extension: null,
  filename: null,
  fullpath: null,
  id: null,
  lastModifiedDate: null,
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
