import * as fs from "fs";
import * as path from "path";
import {
  ARHIVE_DOCUMENTS, DEFAULT_DOCUMENTS_PATH, LOAD_ALL_DOCUMENTS,
  REMOVE_ALL_DOCUMENTS, REMOVE_DOCUMENTS, SELECT_ALL_DOCUMENTS,
  SELECT_DOCUMENT, START, SUCCESS, UNSELECT_ALL_DOCUMENTS,
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
          if (!stat.isDirectory()) {
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
          }
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

export function selectDocument(uid: number) {
  return {
    payload: { uid },
    type: SELECT_DOCUMENT,
  };
}

export function removeDocuments(documents: any) {
  // tslint:disable-next-line:forin
  for (const key in documents) {
    fs.unlinkSync(documents[key].fullpath);
  }

  return {
    type: REMOVE_DOCUMENTS,
  };
}

// tslint:disable-next-line:variable-name
export function arhiveDocuments(documents: any, arhive_name: string) {
  const archive = window.archiver("zip");
  const output = fs.createWriteStream(window.DEFAULT_DOCUMENTS_PATH + "/" + arhive_name);

  archive.pipe(output);

  // tslint:disable-next-line:forin
  for (const key in documents) {
    // console.log(documents[key].fullpath);
    // console.log(documents[key].filename);
    archive.append(fs.readFileSync(documents[key].fullpath), { name: documents[key].filename });
  }
  archive.finalize();
  //output.close();
  return {
    type: ARHIVE_DOCUMENTS,
  };
}

export function unselectAllDocuments() {
  return {
    type: UNSELECT_ALL_DOCUMENTS,
  };
}

export function selectAllDocuments() {
  return {
    type: SELECT_ALL_DOCUMENTS,
  };
}
