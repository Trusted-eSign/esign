import * as fs from "fs";
import * as path from "path";
import {
  DEFAULT_DOCUMENTS_PATH, LOAD_ALL_DOCUMENTS, REMOVE_ALL_DOCUMENTS,
  START, SUCCESS,
} from "../constants";
import { dirExists } from "../utils";

interface IDocument {
  atime: Date;
  birthtime: Date;
  extname: string;
  filename: string;
  filesize: number;
  fullpath: string;
  id: number;
  mtime: Date;
}

export function loadAllDocuments() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_DOCUMENTS + START,
    });

    const documents: IDocument[] = [];

    setTimeout(() => {
      if (dirExists(DEFAULT_DOCUMENTS_PATH)) {
        fs.readdirSync(DEFAULT_DOCUMENTS_PATH).forEach((file) => {
          const fullpath = path.join(DEFAULT_DOCUMENTS_PATH, file);
          const stat = fs.statSync(fullpath);

          documents.push({
            atime: stat.atime,
            birthtime: stat.birthtime,
            extname: path.extname(file),
            filename: file,
            filesize: stat.size,
            fullpath,
            id: Math.random(),
            mtime: stat.mtime,
          });
        });
      }

      dispatch({
        payload: { documents },
        type: LOAD_ALL_DOCUMENTS + SUCCESS,
      });
    }, 0);
  };
}

export function removeAllDocuments() {
  return {
    type: REMOVE_ALL_DOCUMENTS,
  };
}
