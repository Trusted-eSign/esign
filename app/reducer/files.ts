import { Map, OrderedMap, Record } from "immutable";
import { filePackageDelete } from "../AC/index";
import { ACTIVE_FILE, DELETE_FILE, PACKAGE_DELETE_FILE, PACKAGE_SELECT_FILE, SELECT_FILE, START, SUCCESS, VERIFY_SIGNATURE } from "../constants";
import { arrayToMap } from "../utils";

const FileModel = Record({
  active: true,
  extension: null,
  extra: null,
  filename: null,
  fullpath: null,
  id: null,
  lastModifiedDate: null,
  remoteId: null,
  socket: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
  selectedFilesPackage: false,
  selectingFilesPackage: false,
});

export default (files = new DefaultReducerState(), action) => {
  const { type, payload, randomId } = action;

  switch (type) {
    case PACKAGE_SELECT_FILE + START:
      return files
        .set("selectedFilesPackage", false)
        .set("selectingFilesPackage", true);

    case PACKAGE_SELECT_FILE + SUCCESS:
      return files
        .update("entities", (entities) => arrayToMap(payload.filePackage, FileModel).merge(entities))
        .set("selectedFilesPackage", true)
        .set("selectingFilesPackage", false);

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

    case PACKAGE_DELETE_FILE:
      let newFiles = files;
      payload.filePackage.forEach((id: number) => { newFiles = newFiles.deleteIn(["entities", id]); });

      return newFiles;
  }

  return files;
};
