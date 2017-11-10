import * as fs from "fs";
import * as path from "path";
import { SETTINGS_JSON } from "../constants";
import { fileExists } from "../utils";

let odata;

if (fileExists(SETTINGS_JSON)) {
  const data = fs.readFileSync(SETTINGS_JSON, "utf8");
  odata = JSON.parse(data);
}

export default odata;
