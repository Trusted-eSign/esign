import * as fs from "fs";
import { Map, OrderedMap, Record } from "immutable";
import * as path from "path";
import { SETTINGS_JSON } from "../constants";
import { arrayToMap, fileExists, mapToArr } from "../utils";

const RecipientModel = Record({
  certId: null,
});

const DefaultRecipientsState = Record({
  entities: OrderedMap({}),
});

let odata = {};

if (fileExists(SETTINGS_JSON)) {
  const data = fs.readFileSync(SETTINGS_JSON, "utf8");

  if (data) {
    try {
      let recipientsMap = new DefaultRecipientsState();

      odata = JSON.parse(data);

      for (const recipient of odata.recipients) {
        recipientsMap = recipientsMap.setIn(["entities", recipient.certId], new RecipientModel({
          certId: recipient.certId,
        }));
      }

      odata.recipients = recipientsMap;

      if (odata.settings && !odata.settings.cloudCSP) {
        odata.settings.cloudCSP = {
          authURL: "https://dss.cryptopro.ru/STS/oauth",
          restURL: "https://dss.cryptopro.ru/SignServer/rest",
        };
      }
    } catch (e) {
      odata = {};
    }
  }
}

export default odata;
