import { OrderedMap, Record } from "immutable";
import {
  LOAD_ALL_DOCUMENTS, REMOVE_ALL_DOCUMENTS,
  START, SUCCESS,
} from "../constants";
import { arrayToMap } from "../utils";

const DocumentModel = Record({
  atime: null,
  birthtime: null,
  extname: null,
  filename: null,
  filesize: null,
  fullpath: null,
  id: null,
  mtime: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
  loaded: false,
  loading: false,
});

export default (documents = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_ALL_DOCUMENTS + START:
      return documents.set("loading", true);

    case LOAD_ALL_DOCUMENTS + SUCCESS:
      return documents
        .set("entities", arrayToMap(payload.documents, DocumentModel))
        .set("loading", false)
        .set("loaded", true);

    case REMOVE_ALL_DOCUMENTS:
      return documents = new DefaultReducerState();
  }

  return documents;
};
