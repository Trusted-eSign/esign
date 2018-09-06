
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { push } from "react-router-redux";
import {
  ADD_CONNECTION, ADD_REMOTE_FILE, CHANGE_SIGNATURE_DETACHED, CHANGE_SIGNATURE_OUTFOLDER,
  CHANGE_SIGNATURE_TIMESTAMP, DOWNLOAD_REMOTE_FILE,
  LOCATION_ENCRYPT, LOCATION_SIGN, PACKAGE_SELECT_FILE, REMOVE_ALL_FILES, REMOVE_ALL_REMOTE_FILES,
  REMOVE_CONNECTION, SET_CONNECTED, SET_REMOTE_FILES_PARAMS, START, SUCCESS, TOGGLE_SAVE_TO_DOCUMENTS,
} from "../constants";
import store from "../store/index";
import { extFile } from "../utils";
import { CONNECTION, DECRYPT, DISCONNECT, ENCRYPT, SIGN, UNAVAILABLE, VERIFY } from "./constants";
import io from "./socketIO";

// tslint:disable-next-line:no-var-requires
const request = require("request");
const TMP_DIR = os.tmpdir();
const remote = window.electron.remote;

interface IFileProperty {
  name: string;
  url: string;
  id: string;
}

interface ISignRequest {
  id: string;
  method: string;
  params: {
    token: string;
    files: IFileProperty[];
    uploader: string;
    extra: any;
  };
  controller: string;
}

interface IEncryptRequest {
  id: string;
  method: string;
  params: {
    token: string;
    files: IFileProperty[];
    uploader: string;
    extra: any;
  };
  controller: string;
}

io.on(CONNECTION, (socket) => {
  store.dispatch({ type: ADD_CONNECTION, payload: { id: socket.id, socket } });
  store.dispatch({ type: SET_CONNECTED, payload: { id: socket.id } });

  socket.on(SIGN, (data: ISignRequest) => {
    cleanFileLists();
    openWindow(SIGN);
    downloadFiles(data, socket);

    store.dispatch({ type: CHANGE_SIGNATURE_DETACHED, payload: { detached: false } });
    store.dispatch({ type: CHANGE_SIGNATURE_TIMESTAMP, payload: { timestamp: true } });
    store.dispatch({ type: CHANGE_SIGNATURE_OUTFOLDER, payload: { outfolder: "" } });
    store.dispatch({ type: TOGGLE_SAVE_TO_DOCUMENTS, payload: { saveToDocuments: false } });
  });

  socket.on(VERIFY, (data: ISignRequest) => {
    cleanFileLists();
    openWindow(VERIFY);
    downloadFiles(data, socket);

    store.dispatch({ type: CHANGE_SIGNATURE_DETACHED, payload: { detached: false } });
    store.dispatch({ type: CHANGE_SIGNATURE_TIMESTAMP, payload: { timestamp: true } });
    store.dispatch({ type: CHANGE_SIGNATURE_OUTFOLDER, payload: { outfolder: "" } });
    store.dispatch({ type: TOGGLE_SAVE_TO_DOCUMENTS, payload: { saveToDocuments: false } });
  });

  socket.on(ENCRYPT, (data: IEncryptRequest) => {
    cleanFileLists();
    openWindow(ENCRYPT);
    downloadFiles(data, socket);
  });

  socket.on(DECRYPT, (data: IEncryptRequest) => {
    cleanFileLists();
    openWindow(DECRYPT);
    downloadFiles(data, socket);
  });

  socket.on(DISCONNECT, () => {
    store.dispatch({ type: REMOVE_CONNECTION, payload: { id: socket.id, socket } });
  });
});

const downloadFiles = (data: ISignRequest | IEncryptRequest, socket: SocketIO.Socket) => {
  const { params } = data;

  if (!params) {
    return;
  }

  const { extra, files } = params;

  if (!files || !files.length) {
    return;
  }

  store.dispatch({
    payload: {
      method: data.method,
      token: params.token,
      uploader: params.uploader,
    },
    type: SET_REMOTE_FILES_PARAMS,
  });

  files.forEach((file) => {
    const pathForSave = path.join(TMP_DIR, file.name);

    store.dispatch({ type: ADD_REMOTE_FILE, payload: { id: file.id, file: { ...file, socketId: socket.id } } });

    download(file, pathForSave, (err: Error, ss, goodPath) => {
      if (err) {
        socket.emit(UNAVAILABLE, { id: file.id });
        socket.broadcast.emit(UNAVAILABLE, { id: file.id });
      } else {
        if (goodPath) {
          store.dispatch({ type: DOWNLOAD_REMOTE_FILE + SUCCESS, payload: { id: file.id } });

          const fileProps = getFileProperty(goodPath);

          store.dispatch({
            type: PACKAGE_SELECT_FILE + START,
          });

          setTimeout(() => {
            store.dispatch({
              payload: {
                filePackage: [{
                  ...fileProps,
                  active: true,
                  extra,
                  id: Date.now() + Math.random(),
                  remoteId: file.id,
                  socket: socket.id,
                }],
              },
              type: PACKAGE_SELECT_FILE + SUCCESS,
            });
          }, 0);
        }
      }
    });
  });
};

function download(file: IFileProperty, pathname: string, done: (err: Error, url?: string, path?: string) => void): void {
  const { url } = file;
  const sendReq: any = request.get(url);

  sendReq.on("response", (response) => {
    switch (response.statusCode) {
      case 200:
        const totalSize = parseInt(response.headers["content-length"], 10);
        store.dispatch({ type: DOWNLOAD_REMOTE_FILE + START, payload: { id: file.id, totalSize } });

        const stream = fs.createWriteStream(pathname);

        response.on("data", (chunk) => {
          stream.write(chunk);
        }).on("end", () => {
          stream.on("close", () => {
            done(null, url, pathname);
          });
          stream.end();
        });

        break;
      default:
        done(new Error("Server responded with status code" + response.statusCode));
    }
  });

  sendReq.on("error", (err) => {
    fs.unlink(pathname);
    done(err);
  });
}

const getFileProperty = (filepath: string) => {
  const stat = fs.statSync(filepath);

  const extension = extFile(filepath);

  return {
    extension,
    filename: path.basename(filepath),
    fullpath: filepath,
    lastModifiedDate: stat.birthtime,
    size: stat.size,
  };
};

const cleanFileLists = () => {
  store.dispatch({ type: REMOVE_ALL_FILES });
  store.dispatch({ type: REMOVE_ALL_REMOTE_FILES });
};

const openWindow = (operation: string) => {
  remote.getCurrentWindow().show();
  remote.getCurrentWindow().focus();

  switch (operation) {
    case SIGN:
    case VERIFY:
      store.dispatch(push(LOCATION_SIGN));
      return;

    case ENCRYPT:
    case DECRYPT:
      store.dispatch(push(LOCATION_ENCRYPT));
      return;

    default:
      return;
  }
};
