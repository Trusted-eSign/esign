import * as fs from "fs";
import * as path from "path";
import {
  DEFAULT_DOCUMENTS_PATH, LOAD_ALL_DOCUMENTS, REMOVE_ALL_DOCUMENTS, SELECT_ALL_DOCUMENTS,
  SELECT_DOCUMENT, START, SUCCESS, UNSELECT_ALL_DOCUMENTS, REMOVE_DOCUMENTS, ARHIVE_DOCUMENTS,
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

export function selectDocument(uid: number) {
  return {
    payload: { uid },
    type: SELECT_DOCUMENT,
  };
}

export function removeDocuments(documents: any){  
  for (var key in documents) {
    fs.unlinkSync(documents[key].fullpath);
  }
  return {
     type: REMOVE_DOCUMENTS,
  };
}

export function arhiveDocuments(documents: any, arhive_name: string){   
  var archive = window.archiver('zip');
  var output = fs.createWriteStream(window.DEFAULT_DOCUMENTS_PATH + '/' + arhive_name);
  archive.pipe(output);
  for (var key in documents) {
    // console.log(documents[key].fullpath);
    // console.log(documents[key].filename);
    archive.append(fs.readFileSync(documents[key].fullpath), { name: documents[key].filename});
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
