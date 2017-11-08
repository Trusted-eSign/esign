import * as fs from "fs";
import * as path from "path";
import { HOME_DIR } from "../constants";
import { utils } from "../utils";

let odata;

const SETTINGS_JSON = path.join(HOME_DIR, ".Trusted", "Trusted eSign", "settings.json");
if (utils.fileExists(SETTINGS_JSON)) {
  const data = fs.readFileSync(SETTINGS_JSON, "utf8");
  odata = JSON.parse(data);
}

export default odata;
