
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { push } from "react-router-redux";
import { ADD_CONNECTION, REMOVE_ALL_FILES, REMOVE_CONNECTION, SELECT_FILE, SET_CONNECTED } from "../constants";
import store from "../store/index";
import { extFile, toBase64 } from "../utils";
import { CONNECTION, DECRYPT, DISCONNECT, ENCRYPT, SIGN, VERIFY } from "./constants";
import io from "./socketIO";

// tslint:disable-next-line:no-var-requires
const request = require("request");
const TMP_DIR = os.tmpdir();

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
    store.dispatch({ type: REMOVE_ALL_FILES });

    openWindow(SIGN);
    downloadFiles(data, socket.id);
  });

  socket.on(VERIFY, (data: ISignRequest) => {
    store.dispatch({ type: REMOVE_ALL_FILES });

    openWindow(VERIFY);
    downloadFiles(data, socket.id);
  });

  socket.on(ENCRYPT, (data: IEncryptRequest) => {
    store.dispatch({ type: REMOVE_ALL_FILES });

    openWindow(ENCRYPT);
    downloadFiles(data, socket.id);
  });

  socket.on(DECRYPT, (data: IEncryptRequest) => {
    store.dispatch({ type: REMOVE_ALL_FILES });

    openWindow(DECRYPT);
    downloadFiles(data, socket.id);
  });

  socket.on(DISCONNECT, () => {
    store.dispatch({ type: REMOVE_CONNECTION, payload: { id: socket.id, socket } });
  });
});

const downloadFiles = (data: ISignRequest | IEncryptRequest, socketId: string) => {
  const { params } = data;

  if (!params) {
    return;
  }

  const { extra, files } = params;

  if (!files || !files.length) {
    return;
  }

  files.forEach((file) => {
    const pathForSave = path.join(TMP_DIR, file.name);

    download(file.url, pathForSave, (err: Error, ss, goodPath) => {
      if (err) {
        // tslint:disable-next-line:no-console
        console.log("--err", err);
      } else {
        if (goodPath) {
          const fileProps = getFileProperty(goodPath);
          store.dispatch({ generateId: true, type: SELECT_FILE, payload: { file: { ...fileProps, extra, remoteId: file.id, socket: socketId } } });
        }
      }
    });
  });
};

function download(url: string, pathname: string, done: (err: Error, url?: string, path?: string) => void): void {
  const sendReq: any = request.get(url);

  sendReq.on("response", (response) => {
    switch (response.statusCode) {
      case 200:
        const len = parseInt(response.headers["content-length"], 10);
        let cur = 0;
        const total = len / 1048576;

        const stream = fs.createWriteStream(pathname);

        response.on("data", (chunk) => {
          cur += chunk.length;
          console.log("Downloading " + (100.0 * cur / len).toFixed(2) + "% " + (cur / 1048576).toFixed(2) + " mb\r" + ".<br/> Total size: " + total.toFixed(2) + " mb");
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

const openWindow = (operation: string) => {
  switch (operation) {
    case SIGN:
    case VERIFY:
      store.dispatch(push("/sign"));
      return;

    case ENCRYPT:
    case DECRYPT:
      store.dispatch(push("/encrypt"));
      return;

    default:
      return;
  }

  mainWindow.show();
  mainWindow.focus();
};
