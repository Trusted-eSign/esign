import * as fs from "fs";
import { Map, OrderedMap, Record } from "immutable";
import * as path from "path";
import { SERVICES_JSON, SETTINGS_JSON } from "../constants";
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

const ServiceModel = Record({
  id: null,
  name: null,
  settings: OrderedMap({}),
  type: null,
});

const SettingsModel = Record({
  mobileNumber: null,
});

const DefaultServicesState = Record({
  entities: OrderedMap({}),
});

if (fileExists(SERVICES_JSON)) {
  const services = fs.readFileSync(SERVICES_JSON, "utf8");

  if (services) {
    try {
      let servicesMap = new DefaultServicesState();

      const data = JSON.parse(services);

      for (const service of data.services) {
        let mservice = new ServiceModel({...service});
        mservice = mservice.setIn(["settings"], new SettingsModel({mobileNumber: service.settings.mobileNumber}));
        servicesMap = servicesMap.setIn(["entities", service.id], mservice);
      }

      odata.services = servicesMap;
    } catch (e) {
      odata.services = {};
    }
  }
}

export default odata;
