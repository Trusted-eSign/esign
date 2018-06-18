import * as fs from "fs";
import * as readline from "readline";
import { APP_LOG_FILE, LOAD_ALL_EVENTS, REMOVE_ALL_EVENTS, START, SUCCESS } from "../constants";
import { fileExists } from "../utils";

export function loadAllEvents() {
  return (dispatch) => {
    dispatch({
      type: LOAD_ALL_EVENTS + START,
    });

    setTimeout(() => {
      const events: any[] = [];

      if (!fileExists(APP_LOG_FILE)) {
        dispatch({
          payload: {
            events,
          },
          type: LOAD_ALL_EVENTS + SUCCESS,
        });
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(APP_LOG_FILE),
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
