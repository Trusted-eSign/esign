import * as native from "../native";
import { utils } from "../utils";

let odata;

const SETTINGS_JSON = native.path.join(native.HOME_DIR, ".Trusted", "Trusted eSign", "settings.json");
if (utils.fileExists(SETTINGS_JSON)) {
  const data = native.fs.readFileSync(SETTINGS_JSON, "utf8");
  odata = JSON.parse(data);
}

export default odata;
