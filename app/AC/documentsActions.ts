import * as fs from "fs";
import * as path from "path";
import {
  ARHIVE_DOCUMENTS, DEFAULT_DOCUMENTS_PATH, DOCUMENTS_REVIEWED,
  FAIL, LOAD_ALL_DOCUMENTS,
  REMOVE_ALL_DOCUMENTS, REMOVE_DOCUMENTS, SELECT_ALL_DOCUMENTS,
  SELECT_DOCUMENT, START, SUCCESS, UNSELECT_ALL_DOCUMENTS, VERIFY_SIGNATURE,
} from "../constants";
import * as signs from "../trusted/sign";
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

export function documentsReviewed(reviewed: boolean) {
  return {
    payload: { reviewed },
    type: DOCUMENTS_REVIEWED,
  };
}

export function verifySignature(documentId: string) {
  return (dispatch, getState) => {
    const state = getState();
    const { documents } = state;
    const document = documents.getIn(["entities", documentId]);
    let signaruteStatus = false;
    let signatureInfo;
    let cms: trusted.cms.SignedData;

    try {
      cms = signs.loadSign(document.fullpath);

      if (cms.isDetached()) {
        dispatch({
          payload: { fileId: documentId },
          type: VERIFY_SIGNATURE + FAIL,
        });
        return;
      }

      signaruteStatus = signs.verifySign(cms);
      signatureInfo = signs.getSignPropertys(cms);

      signatureInfo = signatureInfo.map((info) => {
        return {
          fileId: documentId,
          ...info,
          id: documentId,
        };
      });

    } catch (error) {
      dispatch({
        payload: { error, fileId: documentId },
        type: VERIFY_SIGNATURE + FAIL,
      });
    }

    if (signatureInfo) {
      dispatch({
        generateId: true,
        payload: { fileId: documentId, signaruteStatus, signatureInfo },
        type: VERIFY_SIGNATURE + SUCCESS,
      });
    }
  };
}
