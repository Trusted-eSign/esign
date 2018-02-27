
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { push } from "react-router-redux";
import store from "../store/index";
import { extFile, toBase64 } from "../utils";
import io from "./socketIO";

// tslint:disable-next-line:no-var-requires
const request = require("request");
const TMP_DIR = os.tmpdir();

interface IFileProperty {
  name: string;
  sys_name: string;
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
  };
  controller: string;
}

io.on("connection", function(socket) {
  // tslint:disable-next-line:no-console
  store.dispatch({ type: "ADD_CONNECTION", payload: {id: socket.id, socket }});
  store.dispatch({ type: "SET_CONNECTED", payload: {id: socket.id }});

  socket.on("sign", (data: ISignRequest) => {
    // tslint:disable-next-line:no-console
    const { params } = data;
    const { files } = params;

    store.dispatch(push("/sign"));
    mainWindow.show();
    mainWindow.focus();

    files.forEach((file) => {
      const pathForSave = path.join(TMP_DIR, file.sys_name);

      download(file.url, pathForSave, (err: Error, ss, goodPath) => {
        if (err) {
          console.log("--err", err);
        } else {
          const fileProps = getFileProperty(goodPath);

          store.dispatch({ generateId: true, type: "SELECT_FILE", payload: { file: { ...fileProps, remoteId: file.id, socket: socket.id } } });
        }
      });
    });
  });

  socket.on("view", (data: ISignRequest) => {
    // tslint:disable-next-line:no-console
    const { params } = data;
    const { files } = params;

    store.dispatch(push("/sign"));
    mainWindow.show();
    mainWindow.focus();

    files.forEach((file) => {
      const pathForSave = path.join(TMP_DIR, file.sys_name);

      download(file.url, pathForSave, (err: Error, ss, goodPath) => {
        if (err) {
          console.log("--err", err);
        } else {
          const fileProps = getFileProperty(goodPath);

          store.dispatch({ generateId: true, type: "SELECT_FILE", payload: { file: { ...fileProps, socket: socket.id } } });
        }
      });
    });
  });

  socket.on("disconnect", function() {
    store.dispatch({ type: "REMOVE_CONNECTION", payload: {id: socket.id, socket }});
  });
});

function download(url: string, pathname: string, done: (err: Error, url?: string, path?: string) => void): void {
  const sendReq: any = request.get(url);

  sendReq.on("response", (response) => {
    switch (response.statusCode) {
      case 200:
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

function getFileProperty(filepath: string) {
  const stat = fs.statSync(filepath);

  const extension = extFile(filepath);

  return {
    extension,
    filename: path.basename(filepath),
    fullpath: filepath,
    lastModifiedDate: stat.birthtime,
    size: stat.size,
  };
}
