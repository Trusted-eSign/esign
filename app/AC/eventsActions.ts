import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { APP_LOG_FILE, LOAD_ALL_EVENTS, REMOVE_ALL_EVENTS, START, SUCCESS } from "../constants";
import { fileExists } from "../utils";

const incFile = () => {
  const fileName = "cryptoarm_gost_operations";

  let indexFile: number = 1;
  let newLogFilePath: string = APP_LOG_FILE;

  do {
    const incName = path.join(path.dirname(APP_LOG_FILE), fileName + indexFile + ".log");

    if (fileExists(incName)) {
      newLogFilePath = incName;
    } else {
      break;
    }

    indexFile++;
  } while (fileExists(newLogFilePath));

  return newLogFilePath;
};

export function loadAllEvents() {
  const LOG_FILE = incFile();

  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_EVENTS + START,
    });

    setTimeout(() => {
      const events: any[] = [];

      if (!fileExists(LOG_FILE)) {
        dispatch({
          payload: {
            events,
          },
          type: LOAD_ALL_EVENTS + SUCCESS,
        });
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(LOG_FILE),
      });

      let index = 0;

      rl
        .on("line", (line) => {
          let data;
          try {
            data = JSON.parse(line);

            events.push({
              ...data,
              id: index,
            });

            index++;
          } catch (e) {
            //
          }
        })
        .on("close", () => {
          dispatch({
            payload: {
              events,
            },
            type: LOAD_ALL_EVENTS + SUCCESS,
          });
        });
    }, 0);
  };
}

export function loadArchiveLogFile(archiveLogFilePath: string) {
  return (dispatch) => {
    dispatch({
      type: REMOVE_ALL_EVENTS,
    });

    dispatch({
      type: LOAD_ALL_EVENTS + START,
    });

    setTimeout(() => {
      const events: any[] = [];

      if (!fileExists(archiveLogFilePath)) {
        dispatch({
          payload: {
            events,
            isArchive: true,
          },
          type: LOAD_ALL_EVENTS + SUCCESS,
        });
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(archiveLogFilePath),
      });

      let index = 0;

      rl
        .on("line", (line) => {
          let data;
          try {
            data = JSON.parse(line);

            events.push({
              ...data,
              id: index,
            });

            index++;
          } catch (e) {
            //
          }
        })
        .on("close", () => {
          dispatch({
            payload: {
              events,
              isArchive: true,
            },
            type: LOAD_ALL_EVENTS + SUCCESS,
          });
        });
    }, 0);
  };
}

export function removeAllEvents() {
  return {
    type: REMOVE_ALL_EVENTS,
  };
}
