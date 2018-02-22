
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { push } from "react-router-redux";
import { selectFile } from "../AC";
import store from "../store/index";
import { extFile, toBase64 } from "../utils";
import io from "./socketIO";

// tslint:disable-next-line:no-var-requires
const ss = require("socket.io-stream");
// tslint:disable-next-line:no-var-requires
const request = require("request");
const TMP_DIR = os.tmpdir();

io.on("connection", function (socket) {
  // tslint:disable-next-line:no-console
  store.dispatch({ type: "ADD_CONNECTION", id: socket.id });
  store.dispatch({ type: "SET_CONNECTED", id: socket.id });

  socket.on("sign file", (file) => {
    store.dispatch(push("/sign"));
    mainWindow.show();

    $(".toast-signercert_not_found").remove();
    Materialize.toast("Выбран файл для полдписи - " + file, 2000, "toast-signercert_not_found");

    setTimeout(() => {
      socket.emit("files signed", file + ".sig");
    }, 5000);

  });

  socket.on("encrypt file", (file) => {
    store.dispatch(push("/encrypt"));
    mainWindow.show();

    $(".toast-signercert_not_found").remove();
    Materialize.toast("Выбран файл для шифрования - " + file, 2000, "toast-signercert_not_found");
  });

  socket.on("bitrix", (data) => {
    // tslint:disable-next-line:no-console
    const { name, url } = data;

    store.dispatch(push("/sign"));
    mainWindow.show();

    const pathForSave = path.join(TMP_DIR, name);

    download(url, pathForSave, (err: Error, ss, goodPath) => {
      if (err) {
        console.log("--err", err);
      } else {
        const file = getFileProperty(goodPath);

        store.dispatch({ generateId: true, type: "SELECT_FILE", payload: { file } });
      }
    });
  });

  ss(socket).on("file stream", function(stream, data) {
    const outpath = path.join(TMP_DIR, data.name);
    stream.pipe(fs.createWriteStream(outpath));
    stream.on("end", function() {
      socket.emit("file saved");

      const file = getFileProperty(outpath);

      store.dispatch({ generateId: true, type: "SELECT_FILE", payload: { file } });
    });
    stream.on("error", function(err) {
      socket.emit("file failed");
    });
  });

  socket.on("disconnect", function() {
    // tslint:disable-next-line:no-console
    console.log("user disconnected");

    store.dispatch({ type: "REMOVE_CONNECTION", id: socket.id });
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
